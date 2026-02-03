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
exports.WporgSnapshot = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const WporgSnapshotSchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    version: { type: String, default: '' },
    active_installs: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    num_ratings: { type: Number, default: 0 },
    short_description: { type: String, default: '' },
    last_updated: { type: Date },
    fetchedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
}, { timestamps: false });
WporgSnapshotSchema.index({ slug: 1 }, { unique: true });
WporgSnapshotSchema.index({ expiresAt: 1 }); // for TTL or manual purge
exports.WporgSnapshot = mongoose_1.default.model('WporgSnapshot', WporgSnapshotSchema);
//# sourceMappingURL=WporgSnapshot.js.map