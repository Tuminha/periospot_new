import { motion } from "framer-motion";
import { GraduationCap, Clock, Globe, Award, Users, Play, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const courses = [
  {
    id: 1,
    title: "Mastering Implant Complications",
    subtitle: "Find the real cause of trouble",
    description: "Learn where to look and how to reveal the often hidden origins of complications, whether in the biology or the technical side.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=500&fit=crop",
    instructor: "Dr. Expert Faculty",
    duration: "16 Blitz-Webinars",
    level: "Advanced",
    language: "English",
    featured: true,
    includes: [
      "3 Modules – 1 free!",
      "16 Blitz-Webinars",
      "17 How-to Videos",
      "Clinical step-by-step procedures",
      "3 e-books included",
      "Certificate and transcript",
      "Community access",
    ],
    price: "€997",
    link: "#",
  },
  {
    id: 2,
    title: "Social Media & Online Marketing for Dentists",
    subtitle: "Grow your online presence",
    description: "Address the main pain-points that dentists face when growing their social media and online presence. From Instagram to YouTube strategies.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=500&fit=crop",
    instructor: "Francisco Teixeira Barbosa",
    duration: "3 hours",
    level: "Intermediate",
    language: "English",
    featured: false,
    includes: [
      "Introduction to social media",
      "Platform-specific strategies",
      "Content creation tips",
      "Marketing fundamentals",
      "Case studies",
    ],
    price: "€197",
    originalPrice: "€120",
    link: "#",
  },
  {
    id: 3,
    title: "Periodontal Surgery Fundamentals",
    subtitle: "Master the basics",
    description: "A comprehensive course covering the fundamentals of periodontal surgery with step-by-step video demonstrations.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=500&fit=crop",
    instructor: "Periospot Faculty",
    duration: "8 hours",
    level: "Beginner",
    language: "English",
    featured: false,
    includes: [
      "Video demonstrations",
      "Clinical cases",
      "Downloadable resources",
      "Quiz assessments",
      "Certificate of completion",
    ],
    price: "€297",
    link: "#",
  },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-500/10 text-green-600";
    case "Intermediate":
      return "bg-yellow-500/10 text-yellow-600";
    case "Advanced":
      return "bg-red-500/10 text-red-600";
    default:
      return "bg-primary/10 text-primary";
  }
};

const OnlineLearning = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <GraduationCap size={16} />
              Online Learning Hub
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Welcome to Periospot<br />Online Learning Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Featured online eLearning courses to help you grow in your professional dental career. 
              Learn from the best instructors in implant dentistry and periodontics.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { icon: Users, label: "Students Enrolled", value: "5,000+" },
              { icon: Play, label: "Video Hours", value: "100+" },
              { icon: Award, label: "Certificates Issued", value: "3,500+" },
              { icon: Globe, label: "Countries Reached", value: "80+" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <stat.icon className="mx-auto text-primary mb-3" size={28} />
                <div className="font-display text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Featured Course */}
          {courses.filter(c => c.featured).map((course) => (
            <motion.section
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-16"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                      Featured Course
                    </Badge>
                    <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                      {course.title}
                    </h2>
                    <p className="text-lg text-primary mb-4">{course.subtitle}</p>
                    <p className="text-muted-foreground mb-6">{course.description}</p>

                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={16} />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe size={16} />
                        {course.language}
                      </div>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {course.includes.slice(0, 6).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="text-green-500" size={14} />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <Button size="lg" className="gap-2">
                        <Play size={18} />
                        Start Course
                      </Button>
                      <span className="font-display text-2xl font-bold text-foreground">
                        {course.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          {/* Other Courses */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              More Courses
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {courses.filter(c => !c.featured).map((course, index) => (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {course.duration}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {course.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {course.originalPrice}
                          </span>
                        )}
                        <span className="font-display text-xl font-bold text-foreground">
                          {course.price}
                        </span>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Play size={16} />
                        View Course
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Knowledge Levels */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20"
          >
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-4">
              Introducing Different Levels of Knowledge
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              From beginner to intermediate and advanced level in just one place.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  level: "Basic Learning",
                  description: "Basic implant biology and techniques",
                  color: "bg-green-500/10 border-green-500/20",
                  textColor: "text-green-600",
                },
                {
                  level: "Intermediate Level",
                  description: "New techniques based on scientific literature",
                  color: "bg-yellow-500/10 border-yellow-500/20",
                  textColor: "text-yellow-600",
                },
                {
                  level: "Master Level",
                  description: "Solving the most complex cases step by step",
                  color: "bg-red-500/10 border-red-500/20",
                  textColor: "text-red-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`${item.color} border rounded-2xl p-8 text-center`}
                >
                  <h3 className={`font-display text-xl font-bold ${item.textColor} mb-3`}>
                    {item.level}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OnlineLearning;
