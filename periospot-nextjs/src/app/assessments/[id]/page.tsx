import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Clock, ClipboardList, ExternalLink } from "lucide-react"

interface AssessmentPageProps {
  params: Promise<{ id: string }>
}

// Assessment data (in production, this would come from a database or API)
const assessmentsData: Record<
  string,
  {
    id: string
    title: string
    description: string
    category: string
    duration: string
    questions: number
    difficulty: string
    typeformUrl: string
  }
> = {
  YgRY7KRD: {
    id: "YgRY7KRD",
    title: "Immediate Loading Survey",
    description:
      "Evaluate your understanding of immediate loading protocols in implant dentistry. This comprehensive assessment covers indications, contraindications, and clinical decision-making for immediate implant loading procedures.",
    category: "Implantology",
    duration: "15-20 min",
    questions: 25,
    difficulty: "Intermediate",
    typeformUrl: "https://form.typeform.com/to/YgRY7KRD",
  },
  mcuv9YyU: {
    id: "mcuv9YyU",
    title: "IMPLANZ Validation Questionnaire",
    description:
      "Comprehensive validation questionnaire for implant treatment planning. Test your knowledge on implant selection, positioning, and prosthetic considerations.",
    category: "Implantology",
    duration: "10-15 min",
    questions: 20,
    difficulty: "Advanced",
    typeformUrl: "https://form.typeform.com/to/mcuv9YyU",
  },
  qRFkPiwt: {
    id: "qRFkPiwt",
    title: "Perio Pulse Feedback Survey",
    description:
      "Quick assessment on periodontal health indicators and treatment protocols. Perfect for dental professionals looking to refresh their perio knowledge.",
    category: "Periodontics",
    duration: "5-10 min",
    questions: 15,
    difficulty: "Beginner",
    typeformUrl: "https://form.typeform.com/to/qRFkPiwt",
  },
  LNrRZ4I5: {
    id: "LNrRZ4I5",
    title: "MedTech Consultancy Assessment",
    description:
      "Evaluate your understanding of medical technology applications in dentistry. Covers digital workflows, CAD/CAM, and innovative treatment approaches.",
    category: "Digital Dentistry",
    duration: "10-15 min",
    questions: 18,
    difficulty: "Intermediate",
    typeformUrl: "https://form.typeform.com/to/LNrRZ4I5",
  },
}

// Generate static params for known assessments
export async function generateStaticParams() {
  return Object.keys(assessmentsData).map((id) => ({ id }))
}

// Generate metadata for each assessment
export async function generateMetadata({
  params,
}: AssessmentPageProps): Promise<Metadata> {
  const { id } = await params
  const assessment = assessmentsData[id]

  if (!assessment) {
    return {
      title: "Assessment Not Found | Periospot",
    }
  }

  return {
    title: `${assessment.title} | Periospot Assessments`,
    description: assessment.description,
    keywords: [
      assessment.category,
      "dental assessment",
      "dental quiz",
      assessment.difficulty,
      "continuing education",
    ],
    openGraph: {
      title: assessment.title,
      description: assessment.description,
      url: `https://periospot.com/assessments/${assessment.id}`,
      type: "website",
    },
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800"
    case "Advanced":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { id } = await params
  const assessment = assessmentsData[id]

  if (!assessment) {
    notFound()
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/assessments"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Assessments
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Assessment Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{assessment.category}</Badge>
                  <Badge className={getDifficultyColor(assessment.difficulty)}>
                    {assessment.difficulty}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{assessment.title}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Duration: {assessment.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span>{assessment.questions} questions</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full">
                    <a
                      href={assessment.typeformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in New Tab
                    </a>
                  </Button>
                </div>

                <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
                  <p className="font-medium">Instructions:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Read each question carefully</li>
                    <li>Select the best answer</li>
                    <li>You can navigate back to review answers</li>
                    <li>Results are shown upon completion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Embedded Typeform */}
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-[700px]">
                  <iframe
                    src={assessment.typeformUrl}
                    title={assessment.title}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="camera; microphone; autoplay; encrypted-media;"
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
