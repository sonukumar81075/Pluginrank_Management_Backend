"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Alert_1 = require("../models/Alert");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAuth);
router.get('/', async (req, res) => {
    const projectId = req.query.project_id;
    const status = req.query.status;
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(String(req.query.per_page), 10) || 20));
    const filter = { userId: req.auth.id };
    if (projectId)
        filter.projectId = projectId;
    if (status)
        filter.status = status;
    const [alerts, total] = await Promise.all([
        Alert_1.Alert.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
        Alert_1.Alert.countDocuments(filter),
    ]);
    res.json({
        data: alerts.map((a) => {
            const doc = a;
            return {
                id: doc._id.toString(),
                projectId: doc.projectId.toString(),
                type: doc.type,
                title: doc.title,
                message: doc.message,
                status: doc.status,
                createdAt: doc.createdAt?.toISOString(),
            };
        }),
        meta: { total, page, per_page: perPage },
    });
});
router.patch('/:id', async (req, res) => {
    const alert = await Alert_1.Alert.findOne({ _id: req.params.id, userId: req.auth.id });
    if (!alert)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    const status = req.body?.status;
    if (status === 'read' || status === 'dismissed') {
        alert.status = status;
        if (status === 'read')
            alert.readAt = new Date();
        await alert.save();
    }
    res.json({ id: alert._id.toString(), status: alert.status });
});
exports.alertRoutes = router;
//# sourceMappingURL=alerts.js.map