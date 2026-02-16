import { addHours, addMinutes, format } from "date-fns";
import type { ICreateSchedulePayload } from "./schedule.interface";
import { prisma } from "../../lib/prisma";
import { convertDateTime } from "./schedule.utils";

class ScheduleService {
  public async createSchedule(payload: ICreateSchedulePayload) {
    const { startDate, endDate, startTime, endTime } = payload;

    const interval = 30;

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    const schedules = [];

    while (currentDate <= lastDate) {
      const startDateTime = new Date(
        addMinutes(
          addHours(
            `${format(currentDate, "yyyy-MM-dd")}`,
            Number(startTime.split(":")[0]),
          ),
          Number(startTime.split(":")[1]),
        ),
      );

      const endDateTime = new Date(
        addMinutes(
          addHours(
            `${format(currentDate, "yyyy-MM-dd")}`,
            Number(endTime.split(":")[0]),
          ),
          Number(endTime.split(":")[1]),
        ),
      );

      while (startDateTime < endDateTime) {
        const s = await convertDateTime(startDateTime);
        const e = await convertDateTime(addMinutes(startDateTime, interval));

        const scheduleData = {
          startDateTime: s,
          endDateTime: e,
        };

        const existingSchedule = await prisma.schedule.findFirst({
          where: {
            startDateTime: scheduleData.startDateTime,
            endDateTime: scheduleData.endDateTime,
          },
        });

        if (!existingSchedule) {
          const result = await prisma.schedule.create({
            data: scheduleData,
          });
          console.log(result);
          schedules.push(result);
        }

        startDateTime.setMinutes(startDateTime.getMinutes() + interval);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
  }

  public getAllSchedules() {
    // Implementation for retrieving all schedules
  }

  public getScheduleById(id: string) {
    // Implementation for retrieving a schedule by its ID
  }

  public updateSchedule(id: string) {
    // Implementation for updating a schedule by its ID
  }

  public deleteSchedule(id: string) {
    // Implementation for deleting a schedule by its ID
  }
}

export default ScheduleService;
