import prisma from "../../../utils/prisma.js";

// Lấy giới hạn bệnh nhân trong ngày từ cấu hình hệ thống
export const getMaxPatientsPerDay = async (): Promise<number> => {
    const config = await prisma.systemConfig.findUnique({
        where: { key: "MAX_PATIENTS_PER_DAY" }
    });
    return config ? parseInt(config.value, 10) : 40; // Default là 40
};

// BM1: Lấy danh sách khám bệnh theo ngày
export const getAppointmentsByDate = async (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return await prisma.appointment.findMany({
        where: {
            scheduleDate: {
                equals: dateObj
            },
            status: "approved"
        },
        include: {
            patient: {
                include: {
                    account: {
                        select: {
                            firstName: true,
                            lastName: true,
                            gender: true,
                            birthDate: true,
                            address: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
};
export const getExamineLogDetails = async (examineId: string) => {
    return await prisma.examineLog.findUnique({
        where: { examineID: examineId },
        include: {
            patient: {
                include: {
                    account: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            },
            details: {
                include: {
                    disease: true
                }
            },
            prescription: {
                include: {
                    details: {
                        include: {
                            medicine: true
                        }
                    }
                }
            }
        }
    });
};
