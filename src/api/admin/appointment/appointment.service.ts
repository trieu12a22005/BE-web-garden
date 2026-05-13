import { AppointmentStatus } from "../../../generated/prisma/index.js";
import prisma from "../../../utils/prisma.js";

function isAppointment(v: unknown): v is AppointmentStatus {
  return typeof v === "string" && (Object.values(AppointmentStatus) as string[]).includes(v);
}
export { isAppointment };

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
  }
}

export class ProhibitedError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
  }
}

type VerifyRefsInput = {
  patientID?: string | null;
  roomID?: string | null;
};

export const verifyRefsForUpdate = async ({ patientID, roomID }: VerifyRefsInput) => {
  if (patientID != null) {
    const patient = await prisma.patient.findUnique({ where: { patientID } });
    if (!patient) throw new NotFoundError("Patient not found");
  }

  if (roomID != null) {
    const room = await prisma.room.findUnique({ where: { roomID } });
    if (!room) throw new NotFoundError("Room not found");
  }
};
