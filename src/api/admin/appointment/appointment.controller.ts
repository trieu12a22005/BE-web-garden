import { NextFunction, Request, Response } from "express";
import prisma, { Prisma } from "../../../utils/prisma.js";
import { isAppointment, NotFoundError, verifyRefsForUpdate } from "./appointment.service.js";
import { AppointmentStatus } from "../../../generated/prisma/index.js";
import { sendMail } from "../../../utils/mailer.js";
import random6Digits from "../../../utils/generateCode.js";

export const CreateAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { appointmentType, scheduleDate, roomID, firstName,
            lastName, phoneNumber, email } = req.body;
        const approvedBy = req.user?.id;
        console.log(approvedBy);
        if (!approvedBy) {
            return res.status(404).json({
                message: "Staff not found"
            })
        }

        // Find or create patient with account
        const account = await prisma.patient.findFirst({
            where: {
                account: {
                    phoneNumber: phoneNumber
                }
            }
        });
        const codePatient = random6Digits("BN")
        const codeAppointment = random6Digits("BV")
        if (!account) {
            // Create new account and patient
            const newAccount = await prisma.account.create({
                data: {
                    firstName,
                    lastName,
                    phoneNumber,
                    email: email,
                    //role: "patient",
                    birthDate: scheduleDate,
                    DisplayID: codePatient,
                    patient: {
                        create: {}
                    }
                }
            });
            const newAppointment = await prisma.appointment.create({
                data: {
                    appointmentType: appointmentType || "examine",
                    scheduleDate: new Date(scheduleDate),
                    roomID,
                    patientID: newAccount.accountID,
                    appointmentDisplayID: codeAppointment,
                    status: "approved",
                    depositStatus: "paid",
                    approvedBy: approvedBy

                },
                include: {
                    patient: { include: { account: true } },
                    room: { include: { faculty: true } },
                    approvedByAccount: true
                }
            });
            return res.status(201).json({ appointment: newAppointment });
        }
        else {
            const newAppointment = await prisma.appointment.create({
                data: {
                    appointmentType: appointmentType || "examine",
                    scheduleDate: new Date(scheduleDate),
                    roomID,
                    patientID: account.patientID,
                    appointmentDisplayID: codeAppointment,
                    status: "approved",
                    depositStatus: "paid",
                    approvedBy: approvedBy
                },
                include: {
                    patient: { include: { account: true } },
                    room: { include: { faculty: true } },
                    approvedByAccount: true
                }
            });
            return res.status(201).json({ appointment: newAppointment });
        }
    } catch (error) {
        next(error);
    }
};

export const GetAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, patientID, scheduleDate, roomID, facultyID } = req.query;

        const where: Prisma.AppointmentWhereInput = {};
        if (status !== undefined && !isAppointment(status)) {
            return res.status(400).json({
                message: "Invalid status value",
                allowed: Object.values(AppointmentStatus),
            });
        }

        if (isAppointment(status)) where.status = status;
        if (patientID && typeof patientID === "string") where.patientID = patientID;
        if (roomID && typeof roomID === "string") where.roomID = roomID;
        // filter theo faculty thông qua room (vì appointment không còn facultyID trực tiếp)
        if (facultyID && typeof facultyID === "string") {
            where.room = { FacultyID: facultyID };
        }

        if (scheduleDate && typeof scheduleDate === "string") {
            const d = new Date(scheduleDate);
            const start = new Date(d); start.setHours(0, 0, 0, 0);
            const end = new Date(d); end.setHours(23, 59, 59, 999);
            where.scheduleDate = { gte: start, lte: end };
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                patient: { include: { account: true } },
                room: { include: { faculty: true } },
                approvedByAccount: true
            },
            orderBy: { createdAt: "desc" }
        });
        console.log(appointments);

        return res.status(200).json({ appointments });
    } catch (error) {
        next(error);
    }
};

export const GetAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const appointmentID = Array.isArray(id) ? id[0] : id;

        if (!appointmentID) {
            return res.status(400).json({ message: "Appointment ID is required" });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { appointmentID },
            include: {
                patient: { include: { account: true } },
                room: { include: { faculty: true } },
                approvedByAccount: true,
                enterTickets: true
            }
        });

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        return res.status(200).json({ appointment });
    } catch (error) {
        next(error);
    }
};

export const UpdateAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentID = req.params.id;
        const { status, depositStatus, roomID, scheduleDate, patientID } = req.body;
        const approvedBy = req.user?.id;
        if (!appointmentID) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (Array.isArray(appointmentID)) {
            return res.status(400).json({ message: "id must be a string, not an array" });
        }
        await verifyRefsForUpdate({ patientID, roomID });

        const updateData: Prisma.AppointmentUncheckedUpdateInput = {};
        if (status) updateData.status = status;
        if (depositStatus) updateData.depositStatus = depositStatus;
        if (roomID) updateData.roomID = roomID;
        if (patientID) updateData.patientID = patientID;
        if (approvedBy) updateData.approvedBy = approvedBy;
        if (scheduleDate) updateData.scheduleDate = new Date(scheduleDate);

        const result = await prisma.appointment.update({
            where: { appointmentID },
            data: updateData,
            include: {
                patient: { include: { account: true } },
                room: { include: { faculty: true } },
                approvedByAccount: true
            }
        });

        if (result) {
            return res.status(200).json({
                message: "Update successful",
                appointment: result
            });
        }
    } catch (err) {
        if (err instanceof NotFoundError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        next(err);
    }
};

export const ApproveAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentID = req.params.id;
        const { roomID } = req.body;
        const approvedBy = req.user?.id;
        if (!appointmentID || Array.isArray(appointmentID)) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        if (!approvedBy) {
            return res.status(400).json({ message: "approvedBy staff ID is required" });
        }
        if (roomID) {
            const room = await prisma.room.findUnique({ where: { roomID } });
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }
        }

        const appointment = await prisma.appointment.update({
            where: { appointmentID },
            data: { status: "approved", approvedBy, roomID },
            include: {
                patient: { include: { account: true } },
                room: { include: { faculty: true } },
                approvedByAccount: true
            }
        });

        return res.status(200).json({
            message: "Appointment approved",
            appointment
        });
    } catch (error) {
        next(error);
    }
};

export const CancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentID = req.params.id;

        if (!appointmentID || Array.isArray(appointmentID)) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const appointment = await prisma.appointment.update({
            where: { appointmentID },
            data: { status: "cancelled" },
            include: {
                patient: { include: { account: true } },
                room: { include: { faculty: true } },
                doctor: true
            }
        });

        // Send cancellation email to patient
        if (appointment.patient?.account?.email) {
            const scheduleDate = new Date(appointment.scheduleDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const emailHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c; margin-bottom: 20px;">Thông báo hủy lịch khám</h2>
                    <p style="color: #333; line-height: 1.6;">Kính gửi <strong>${appointment.patient.account.firstName}</strong>,</p>
                    <p style="color: #333; line-height: 1.6;">Rất tiếc, lịch khám của bạn đã được hủy.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
                        <p><strong>Thông tin lịch khám:</strong></p>
                        <p style="margin: 8px 0;"><strong>Mã lịch khám:</strong> ${appointment.appointmentDisplayID}</p>
                        <p style="margin: 8px 0;"><strong>Ngày khám:</strong> ${scheduleDate}</p>
                        <p style="margin: 8px 0;"><strong>Loại khám:</strong> ${appointment.appointmentType}</p>
                        ${appointment.doctor ? `<p style="margin: 8px 0;"><strong>Bác sĩ:</strong> ${appointment.doctor.lastName || ""}</p>` : ''}
                        ${appointment.room ? `<p style="margin: 8px 0;"><strong>Phòng:</strong> ${appointment.room.roomName}</p>` : ''}
                    </div>
                    <p style="color: #333; line-height: 1.6;">Nếu você cần đặt lịch khám mới, vui lòng liên hệ với bộ phận tiếp tân hoặc đặt lịch trực tuyến.</p>
                    <p style="color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px;">
                        Email này được gửi tự động từ hệ thống quản lý phòng khám. Vui lòng không trả lời email này.
                    </p>
                </div>
            </div>
            `;

            await sendMail({
                // to: appointment.patient.account.email,
                to: "23521655@gm.uit.edu.vn",
                subject: "Thông báo hủy lịch khám",
                html: emailHtml
            }).catch(err => {
                console.error("Error sending cancellation email:", err);
                // Don't throw error, let the appointment cancellation succeed even if email fails
            });
        }
        else {
            return res.status(400).json({
                message: "Can't send email"
            });
        }
        return res.status(200).json({
            message: "Appointment cancelled"
        });
    } catch (error) {
        next(error);
    }
};

export const DeleteAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentID = req.params.id;

        if (!appointmentID) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (Array.isArray(appointmentID)) {
            return res.status(400).json({ message: "id must be a string, not an array" });
        }

        const result = await prisma.appointment.delete({
            where: { appointmentID }
        });

        if (result) {
            return res.status(200).json({
                message: "Delete Successful"
            });
        }
    } catch (error) {
        next(error);
    }
};

export const DeleteManyAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { appointmentIds } = req.body;

        const result = await prisma.appointment.deleteMany({
            where: { appointmentID: { in: appointmentIds } }
        });

        if (result) {
            return res.status(200).json({
                message: "Delete successful",
                deletedCount: result.count
            });
        }
    } catch (error) {
        next(error);
    }
};