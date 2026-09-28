const ReportService = require('../services/reportService');

class ReportController {
  static async processReport(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
      const data = await ReportService.analyzeMedicalReport(req.file.buffer, req.file.mimetype);
      return res.status(200).json({ success: true, filename: req.file.originalname, data });
    } catch (err) { next(err); }
  }
}
module.exports = ReportController;