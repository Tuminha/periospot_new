import { motion } from "framer-motion";
import { Search, Clock, HelpCircle, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categories = ["All", "Implantology", "Periodontics", "Surgery", "Diagnosis"];

const mockAssessments = [
  {
    id: 1,
    title: "Implant Placement Fundamentals",
    description: "Test your knowledge on basic implant placement principles and protocols.",
    questions: 20,
    time: "15 min",
    difficulty: "Beginner",
    category: "Implantology",
  },
  {
    id: 2,
    title: "Periodontal Disease Classification",
    description: "Assess your understanding of the 2017 periodontal disease classification system.",
    questions: 25,
    time: "20 min",
    difficulty: "Intermediate",
    category: "Periodontics",
  },
  {
    id: 3,
    title: "Bone Grafting Techniques",
    description: "Advanced assessment on bone augmentation and grafting procedures.",
    questions: 30,
    time: "25 min",
    difficulty: "Advanced",
    category: "Surgery",
  },
  {
    id: 4,
    title: "Radiographic Interpretation",
    description: "Test your skills in interpreting dental radiographs for implant planning.",
    questions: 15,
    time: "12 min",
    difficulty: "Intermediate",
    category: "Diagnosis",
  },
  {
    id: 5,
    title: "Peri-implant Diseases",
    description: "Comprehensive quiz on peri-implantitis and peri-implant mucositis.",
    questions: 20,
    time: "18 min",
    difficulty: "Advanced",
    category: "Implantology",
  },
  {
    id: 6,
    title: "Non-Surgical Therapy",
    description: "Assessment on non-surgical periodontal treatment approaches.",
    questions: 18,
    time: "15 min",
    difficulty: "Beginner",
    category: "Periodontics",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-500/10 text-green-500";
    case "Intermediate":
      return "bg-yellow-500/10 text-yellow-500";
    case "Advanced":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Assessments = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Assessments
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Test your knowledge with our expert-designed quizzes and earn certificates.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-10"
          >
            <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3">
              <Search size={20} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assessments..."
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    category === "All"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Assessments Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-elevated transition-shadow"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {assessment.category}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(assessment.difficulty)}`}>
                    {assessment.difficulty}
                  </span>
                </div>
                
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  {assessment.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {assessment.description}
                </p>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle size={16} />
                    <span>{assessment.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{assessment.time}</span>
                  </div>
                </div>
                
                <a
                  href={`/assessments/${assessment.id}`}
                  className="block w-full text-center bg-primary text-primary-foreground py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  Start Quiz
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Assessments;
