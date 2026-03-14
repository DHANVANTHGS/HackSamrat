const { PrismaClient } = require("@prisma/client");
const { GoogleGenAI } = require("@google/genai");
const { PrismaPg } = require("@prisma/adapter-pg");
const dotenv = require("dotenv");

dotenv.config();

const schema = process.env.POSTGRES_SCHEMA || "public";
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema }),
});

async function notifyDemoPatient() {
    if (!process.env.GEMINI_API_KEY) {
        console.log("No Gemini API key found, skipping proactive notification.");
        return;
    }

    const patientUser = await prisma.user.findUnique({
        where: { email: "patient.demo@hacksamrat.local" },
        include: {
            patient: {
                include: {
                    insurancePolicies: true,
                    claims: true,
                }
            }
        }
    });

    if (!patientUser || !patientUser.patient) {
        console.log("Demo patient not found.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
You are the HackSamrat HealthVault proactive AI engine. 
Analyze this patient's data and write a VERY SHORT 1-2 sentence recommendation for a government health scheme in India (like PM-JAY or state schemes) or a private policy they might be eligible for. 
Keep it concise so it fits in a push notification. Do not use markdown.

Profile: ${patientUser.patient.healthSummary || "No summary"}
Policies: ${patientUser.patient.insurancePolicies.length}
Claims: ${patientUser.patient.claims.length}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { temperature: 0.2 }
        });

        const recommendation = response.text.trim();

        await prisma.notification.create({
            data: {
                userId: patientUser.id,
                type: "SYSTEM",
                title: "AI Scheme Analysis Recommendation",
                message: recommendation,
                readAt: null,
            }
        });

        console.log("Successfully generated and sent AI notification:", recommendation);
    } catch (err) {
        console.error("Error generating proactive notification", err);
    }
}

notifyDemoPatient()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
