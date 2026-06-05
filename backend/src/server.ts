import app from "./app";
import { startAlertJobs } from "./jobs/alert.job";
const PORT = 5000;

startAlertJobs();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});