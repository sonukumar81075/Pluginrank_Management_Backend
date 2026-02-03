"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReadme = analyzeReadme;
exports.getLatestReadmeAnalysis = getLatestReadmeAnalysis;
const config_1 = require("../config");
const ReadmeAnalysis_1 = require("../models/ReadmeAnalysis");
const Project_1 = require("../models/Project");
const mongoose_1 = __importDefault(require("mongoose"));
const SVN_BASE = config_1.config.wpOrg.svnReadmeBase;
const SECTIONS = ['description', 'installation', 'faq', 'screenshots', 'changelog', 'upgrade', 'short description', 'other notes'];
async function analyzeReadme(projectId) {
    const project = await Project_1.Project.findById(projectId).lean();
    if (!project)
        return null;
    const slug = project.slug;
    const primaryKeywords = project.primary_keywords ?? [];
    const keyword = primaryKeywords[0]?.toLowerCase() ?? '';
    const url = `${SVN_BASE}/${slug}/trunk/readme.txt`;
    let text;
    try {
        const res = await fetch(url);
        if (!res.ok)
            return null;
        text = await res.text();
    }
    catch {
        return null;
    }
    const lines = text.split(/\r?\n/);
    const sections = {};
    let currentSection = '';
    let currentContent = [];
    for (const line of lines) {
        const match = line.match(/^===?\s+(.+?)\s*===?$/);
        if (match) {
            if (currentSection) {
                sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
            }
            currentSection = match[1].trim();
            currentContent = [];
        }
        else {
            currentContent.push(line);
        }
    }
    if (currentSection) {
        sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
    }
    const sectionOrder = Object.keys(sections);
    const sectionsPresent = sectionOrder.filter((s) => s.length > 0);
    const sectionsMissing = SECTIONS.filter((s) => !sectionsPresent.some((p) => p.includes(s) || s.includes(p)));
    const fullText = text.toLowerCase();
    const keywordFrequency = keyword ? (fullText.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'))?.length ?? 0) : 0;
    const firstLines = text.slice(0, 1500);
    const first100Words = firstLines.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    const keywordInTitle = keyword ? firstLines.toLowerCase().includes(keyword) : false;
    const keywordInFirst100 = keyword ? first100Words.includes(keyword.toLowerCase()) : false;
    let score = 50;
    if (keywordInTitle)
        score += 15;
    if (keywordInFirst100)
        score += 15;
    if (keywordFrequency >= 3)
        score += 10;
    if (sectionsPresent.length >= 4)
        score += 10;
    if (sectionsMissing.length === 0)
        score += 5;
    score = Math.min(100, Math.max(0, score));
    const recommendations = [];
    if (!keywordInTitle && keyword)
        recommendations.push('Add primary keyword to the plugin title (first line).');
    if (!keywordInFirst100 && keyword)
        recommendations.push('Include primary keyword in the first 100 words.');
    if (sectionsMissing.length > 0)
        recommendations.push(`Add missing sections: ${sectionsMissing.join(', ')}.`);
    if (keywordFrequency < 2 && keyword)
        recommendations.push('Increase keyword density in the readme.');
    await ReadmeAnalysis_1.ReadmeAnalysis.create({
        projectId: typeof projectId === 'string' ? new mongoose_1.default.Types.ObjectId(projectId) : projectId,
        slug,
        score,
        keywordInTitle,
        keywordInFirst100,
        keywordFrequency,
        sectionsPresent: sectionsPresent,
        sectionsMissing,
        sectionOrder: sectionsPresent,
        recommendations,
        analyzedAt: new Date(),
    });
    return {
        score,
        insights: {
            keywordInTitle,
            keywordInFirst100,
            keywordFrequency,
            sectionsPresent,
            sectionsMissing,
            sectionOrder: sectionsPresent,
            recommendations,
        },
    };
}
async function getLatestReadmeAnalysis(projectId) {
    const doc = await ReadmeAnalysis_1.ReadmeAnalysis.findOne({ projectId }).sort({ analyzedAt: -1 }).lean();
    if (!doc)
        return null;
    const d = doc;
    return {
        projectId: d.projectId.toString(),
        slug: d.slug,
        score: d.score,
        lastAnalyzedAt: d.analyzedAt.toISOString(),
        insights: {
            keywordInTitle: d.keywordInTitle,
            keywordInFirst100: d.keywordInFirst100,
            keywordFrequency: d.keywordFrequency,
            sectionsPresent: d.sectionsPresent,
            sectionsMissing: d.sectionsMissing,
            sectionOrder: d.sectionOrder,
            recommendations: d.recommendations,
        },
    };
}
//# sourceMappingURL=readmeService.js.map