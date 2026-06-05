import cron from "node-cron";

import {
  generateLowStockAlerts,
  generateExpiryAlerts,
} from "../modules/alerts/alerts.service";

export const startAlertJobs = () => {
  cron.schedule(
    "0 0 * * *",
    // "*/1 * * * *",
    async () => {
      console.log(
        "Running daily alert checks..."
      );

      try {
        await generateLowStockAlerts();

        await generateExpiryAlerts();

        console.log(
          "Alert checks completed"
        );
      } catch (error) {
        console.error(
          "Alert job failed:",
          error
        );
      }
    }
  );
};