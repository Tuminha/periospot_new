import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardList, Clock, Award, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Assessments | Periospot - Test Your Knowledge",
  description:
    "Take professional dental assessments and quizzes to evaluate your knowledge in implantology, periodontics, and aesthetic dentistry. Get instant feedback and certificates.",
  keywords: [
    "dental assessment",
    "implantology quiz",
    "periodontics test",
    "dental knowledge evaluation",
    "continuing education",
    "dental certification",
  ],
  openGraph: {
    title: "Dental Assessments | Periospot",
    description:
      "Evaluate your knowledge with professional dental assessments in implantology and periodontics.",
    url: "https://periospot.com/assessments",
    type: "website",
  },
}

// Featured assessments data
const assessments = [
  {
    id: "YgRY7KRD",
    title: "Immediate Loading Survey",
    description:
      "Evaluate your understanding of immediate loading protocols in implant dentistry. This comprehensive assessment covers indications, contraindications, and clinical decision-making.",
    category: "Implantology",
    duration: "15-20 min",
    questions: 25,
    difficulty: "Intermediate",
    responses: 856,
    featured: true,
  },
  {
    id: "mcuv9YyU",
    title: "IMPLANZ Validation Questionnaire",
    description:
      "Comprehensive validation questionnaire for implant treatment planning. Test your knowledge on implant selection, positioning, and prosthetic considerations.",
    category: "Implantology",
    duration: "10-15 min",
    questions: 20,
    difficulty: "Advanced",
    responses: 6,
    featured: true,
  },
  {
    id: "qRFkPiwt",
    title: "Perio Pulse Feedback Survey",
    description:
      "Quick assessment on periodontal health indicators and treatment protocols. Perfect for dental professionals looking to refresh their perio knowledge.",
    category: "Periodontics",
    duration: "5-10 min",
    questions: 15,
    difficulty: "Beginner",
    responses: 13,
    featured: false,
  },
  {
    id: "LNrRZ4I5",
    title: "MedTech Consultancy Assessment",
    description:
      "Evaluate your understanding of medical technology applications in dentistry. Covers digital workflows, CAD/CAM, and innovative treatment approaches.",
    category: "Digital Dentistry",
    duration: "10-15 min",
    questions: 18,
    difficulty: "Intermediate",
    responses: 1,
    featured: false,
  },
]

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

export default function AssessmentsPage() {
  const featuredAssessments = assessments.filter((a) => a.featured)
  const otherAssessments = assessments.filter((a) => !a.featured)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              Professional Development
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Dental Assessments
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Test your knowledge with our professional assessments designed by
              experts in implantology, periodontics, and aesthetic dentistry.
              Get instant feedback and track your progress.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <ClipboardList className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">{assessments.length}</p>
              <p className="text-sm text-muted-foreground">Assessments</p>
            </div>
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <Clock className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">5-20</p>
              <p className="text-sm text-muted-foreground">Minutes each</p>
            </div>
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <Award className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">CE</p>
              <p className="text-sm text-muted-foreground">Credits Available</p>
            </div>
            <div className="rounded-lg bg-card p-4 text-center shadow-sm">
              <TrendingUp className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-2xl font-bold">
                {assessments.reduce((sum, a) => sum + a.responses, 0)}+
              </p>
              <p className="text-sm text-muted-foreground">Completions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Assessments */}
      <section className="py-12">
        <div className="container">
          <h2 className="mb-6 text-2xl font-bold">Featured Assessments</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredAssessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {assessment.category}
                      </Badge>
                      <CardTitle className="text-xl">
                        {assessment.title}
                      </CardTitle>
                    </div>
                    <Badge className={getDifficultyColor(assessment.difficulty)}>
                      {assessment.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{assessment.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-end">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {assessment.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="h-4 w-4" />
                      {assessment.questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {assessment.responses} completions
                    </span>
                  </div>
                  <Button asChild className="mt-4 w-full">
                    <Link href={`/assessments/${assessment.id}`}>
                      Start Assessment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Assessments */}
      {otherAssessments.length > 0 && (
        <section className="border-t py-12">
          <div className="container">
            <h2 className="mb-6 text-2xl font-bold">More Assessments</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherAssessments.map((assessment) => (
                <Card
                  key={assessment.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {assessment.category}
                      </Badge>
                      <Badge
                        className={`text-xs ${getDifficultyColor(assessment.difficulty)}`}
                      >
                        {assessment.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">
                      {assessment.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {assessment.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{assessment.duration}</span>
                      <span>{assessment.questions} questions</span>
                    </div>
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link href={`/assessments/${assessment.id}`}>
                        Take Assessment
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">
              Want Custom Assessments for Your Team?
            </h2>
            <p className="mt-3 text-muted-foreground">
              We can create personalized assessments tailored to your
              organization&apos;s learning objectives and curriculum.
            </p>
            <Button asChild className="mt-6">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
