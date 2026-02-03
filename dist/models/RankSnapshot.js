"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankSnapshot = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RankSnapshotSchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true },
    keywordId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Keyword', required: true },
    country: { type: String, required: true, trim: true },
    device: { type: String, enum: ['desktop', 'mobile'], required: true },
    date: { type: Date, required: true },
    granularity: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    position: { type: Number, required: true },
    url: { type: String },
    serpFeatures: { type: [String], default: [] },
}, { timestamps: { createdAt: true, updatedAt: false } });
RankSnapshotSchema.index({ projectId: 1, keywordId: 1, country: 1, device: 1, date: 1, granularity: 1 }, { unique: true });
RankSnapshotSchema.index({ projectId: 1, date: 1, granularity: 1 });
RankSnapshotSchema.index({ date: 1, granularity: 1 }); // for retention/archival
exports.RankSnapshot = mongoose_1.default.model('RankSnapshot', RankSnapshotSchema);
//# sourceMappingURL=RankSnapshot.js.map