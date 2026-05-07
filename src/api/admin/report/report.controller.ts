import { Request, Response, NextFunction } from "express";
import { getAppointmentsByDate, getExamineLogDetails, getMaxPatientsPerDay } from "./report.service.js";

export const getExaminationList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;
        if (!date || typeof date !== "string") {
            return res.status(400).json({ message: "Vui lòng cung cấp tham số 'date' (YYYY-MM-DD)" });
        }

        const maxPatients = await getMaxPatientsPerDay();
        const appointments = await getAppointmentsByDate(date);
        const data = appointments.map((app, index) => {
            const account = app.patient.account;
            const fullName = `${account.firstName || ""} ${account.lastName || ""}`.trim();
            const birthYear = account.birthDate ? new Date(account.birthDate).getFullYear() : "";

            return {
                stt: index + 1,
                fullName: fullName,
                gender: account.gender === "male" ? "Nam" : account.gender === "female" ? "Nữ" : "",
                birthYear: birthYear,
                address: account.address || ""
            };
        });

        return res.status(200).json({
            title: "Danh Sách Khám Bệnh",
            date: date,
            maxPatientsLimit: maxPatients,
            totalPatients: data.length,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

export const getExaminationTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { examineId } = req.params;
        if (!examineId) {
            return res.status(400).json({ message: "Vui lòng cung cấp 'examineId'" });
        }

        const examineLog = await getExamineLogDetails(examineId.toString());
        if (!examineLog) {
            return res.status(404).json({ message: "Không tìm thấy phiên khám" });
        }

        const account = examineLog.patient.account;
        const fullName = `${account.firstName || ""} ${account.lastName || ""}`.trim();

        // Dự đoán loại bệnh
        const predictedDiseases = examineLog.details.map(d => d.disease.diseaseName).join(", ");

        // Danh sách thuốc
        const medicines = examineLog.prescription?.details.map((d, index) => {
            return {
                stt: index + 1,
                medicineName: d.medicine.medicineName,
                unit: d.medicine.unit === "bottle" ? "Chai" : d.medicine.unit === "capsule" ? "Viên" : "Khác",
                quantity: d.quantity,
                usage: d.usage
            };
        }) || [];

        // Format dữ liệu theo BM2
        return res.status(200).json({
            title: "Phiếu Khám Bệnh",
            fullName: fullName,
            date: examineLog.createdAt.toISOString().split("T")[0],
            symptoms: examineLog.symptoms,
            predictedDisease: predictedDiseases,
            medicines: medicines
        });
    } catch (error) {
        next(error);
    }
};
