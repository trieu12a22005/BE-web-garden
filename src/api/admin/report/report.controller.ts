import { Request, Response, NextFunction } from "express";
import { getAppointmentsByDate, getExamineLogDetails, getMaxPatientsPerDay, getExamineLogsByDate, getMonthlyRevenueReport, getMedicineUsageReport } from "./report.service.js";

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

// BM3: Danh Sách Bệnh Nhân
export const getPatientList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;
        if (!date || typeof date !== "string") {
            return res.status(400).json({ message: "Vui lòng cung cấp tham số 'date' (YYYY-MM-DD)" });
        }

        const logs = await getExamineLogsByDate(date);
        
        const data = logs.map((log, index) => {
            const account = log.patient.account;
            const fullName = `${account.firstName || ""} ${account.lastName || ""}`.trim();
            const predictedDiseases = log.details.map(d => d.disease.diseaseName).join(", ");
            
            return {
                stt: index + 1,
                fullName: fullName,
                date: log.createdAt.toISOString().split("T")[0],
                diseaseType: predictedDiseases,
                symptoms: log.symptoms
            };
        });

        return res.status(200).json({
            title: "Danh Sách Bệnh Nhân",
            date: date,
            totalPatients: data.length,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// BM4: Hóa Đơn Thanh Toán
export const getPaymentBill = async (req: Request, res: Response, next: NextFunction) => {
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
        
        // Tính tiền khám (Fix cứng 30.000 hoặc lấy từ config)
        const examineFee = 30000;
        
        // Tính tiền thuốc
        let medicineFee = 0;
        if (examineLog.prescription && examineLog.prescription.details) {
            examineLog.prescription.details.forEach(d => {
                medicineFee += Number(d.quantity) * Number(d.medicine.price || 0);
            });
        }

        return res.status(200).json({
            title: "Hóa Đơn Thanh Toán",
            fullName: fullName,
            date: examineLog.createdAt.toISOString().split("T")[0],
            examineFee: examineFee,
            medicineFee: medicineFee,
            totalFee: examineFee + medicineFee
        });
    } catch (error) {
        next(error);
    }
};

// BM5.1: Báo Cáo Doanh Thu Theo Tháng
export const getMonthlyRevenue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Vui lòng cung cấp tham số 'month' và 'year'" });
        }

        const monthNum = parseInt(month.toString(), 10);
        const yearNum = parseInt(year.toString(), 10);
        
        const reports = await getMonthlyRevenueReport(monthNum, yearNum);
        
        let totalRevenue = 0;
        reports.forEach(r => {
            totalRevenue += Number(r.revenue || 0);
        });

        const data = reports.map((r, index) => {
            const revenue = Number(r.revenue || 0);
            const ratio = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
            return {
                stt: index + 1,
                date: `${r.date}/${r.month}/${r.year}`,
                patientCount: r.patientCount,
                revenue: revenue,
                ratio: ratio.toFixed(2) + '%'
            };
        });

        return res.status(200).json({
            title: "Báo Cáo Doanh Thu Theo Tháng",
            month: monthNum,
            year: yearNum,
            totalRevenue: totalRevenue,
            data: data
        });
    } catch (error) {
        next(error);
    }
};

// BM5.2: Báo Cáo Sử Dụng Thuốc
export const getMedicineUsage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Vui lòng cung cấp tham số 'month' và 'year'" });
        }

        const monthNum = parseInt(month.toString(), 10);
        const yearNum = parseInt(year.toString(), 10);
        
        const reports = await getMedicineUsageReport(monthNum, yearNum);
        
        const data = reports.map((r, index) => {
            return {
                stt: index + 1,
                medicineName: r.medicine.medicineName,
                unit: r.medicine.unit === "bottle" ? "Chai" : r.medicine.unit === "capsule" ? "Viên" : "Khác",
                // Ghi chú: quantity hiện đang dùng count số lần dùng
                // Nếu cần quantity tổng, cần điều chỉnh MedicineMonthReport hoặc aggregate query
                quantity: r.useCount, // Tạm thời map vào useCount
                useCount: r.useCount
            };
        });

        return res.status(200).json({
            title: "Báo Cáo Sử Dụng Thuốc",
            month: monthNum,
            year: yearNum,
            data: data
        });
    } catch (error) {
        next(error);
    }
};
