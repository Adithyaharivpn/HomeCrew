const Report = require('../models/Report');
const logger = require('../utils/logger');

const submitReport = async (req, res) => {
  try {
    const { reportedUserId, jobId, roomId, reason, description } = req.body;
    
    if (!reportedUserId || reportedUserId === 'undefined' || reportedUserId === 'null') {
        return res.status(400).json({ error: "Invalid Reported User ID. Please try again." });
    }

    const reportData = {
      reporterId: req.user.id,
      reportedUserId,
      jobId: (jobId && jobId !== 'undefined' && jobId !== 'null') ? jobId : null, 
      roomId: (roomId && roomId !== 'undefined' && roomId !== 'null') ? roomId : null,
      reason,
      description
    };

    if (req.file) {
      reportData.evidenceUrl = req.file.path;
    }

    const report = new Report(reportData);
    await report.save();

    logger.info(`New Report Submitted: by ${req.user.id} against ${reportedUserId}`);
    res.status(201).json({ message: "Report submitted successfully", report });

  } catch (error) {
    logger.error(`Report Submission Error: ${error.message}`);
    res.status(500).json({ error: "Failed to submit report" });
  }
};

const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reporterId', 'name email')
            .populate('reportedUserId', 'name email role')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        logger.error(`Fetch Reports Error: ${error.message}`);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};

const Notification = require('../models/Notification');

const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
        if (!report) return res.status(404).json({ error: "Report not found" });

        // Notify Reporter
        await report.populate('reportedUserId', 'name');
        
        const notificationMessage = `Your report against ${report.reportedUserId?.name || 'User'} has been marked as ${status}.`;
        
        const notification = new Notification({
            recipient: report.reporterId,
            sender: req.user.id, // Admin ID
            message: notificationMessage,
            type: 'system',
            link: '/dashboard/support' // Or relevant link
        });
        await notification.save();

        const io = req.app.get('io');
        if (io) {
            io.to(report.reporterId.toString()).emit("receiveNotification", notification);
        }

        res.json(report);
    } catch (error) {
        logger.error(`Update Report Error: ${error.message}`);
        res.status(500).json({ error: "Failed to update report" });
    }
};

module.exports = { submitReport, getReports, updateReportStatus };
