import { motion } from "framer-motion";
import { Mail, Linkedin, Twitter, Instagram, Youtube, MapPin, Phone, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const teamMembers = [
  {
    id: 1,
    name: "Dr. Francisco Teixeira Barbosa",
    role: "Founder & CEO",
    bio: "Periodontist and implant dentistry specialist with a passion for dental education and online content creation.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    social: {
      linkedin: "#",
      twitter: "#",
      instagram: "#",
    },
  },
  {
    id: 2,
    name: "Dr. Maria Santos",
    role: "Head of Education",
    bio: "Expert in periodontal surgery and regenerative procedures. Leading our educational content development.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    social: {
      linkedin: "#",
      twitter: "#",
    },
  },
  {
    id: 3,
    name: "Carlos Rodriguez",
    role: "Creative Director",
    bio: "Responsible for all animations, illustrations, and visual content that makes Periospot unique.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    social: {
      linkedin: "#",
      instagram: "#",
    },
  },
  {
    id: 4,
    name: "Ana López",
    role: "Content Manager",
    bio: "Managing our content strategy across all platforms and ensuring consistent quality.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    social: {
      linkedin: "#",
      twitter: "#",
    },
  },
];

const Team = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Team & Contact
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the passionate team behind Periospot and get in touch with us.
            </p>
          </motion.div>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-12">
              Meet Our Team
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="group text-center"
                >
                  <div className="relative mb-4 mx-auto w-48 h-48">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full" />
                    <img
                      src={member.image}
                      alt={member.name}
                      className="relative w-full h-full object-cover rounded-full border-4 border-background shadow-elevated"
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                  <div className="flex justify-center gap-3">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Twitter size={18} />
                      </a>
                    )}
                    {member.social.instagram && (
                      <a
                        href={member.social.instagram}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram size={18} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                  <Textarea
                    placeholder="Your message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                  <Button type="submit" size="lg" className="w-full gap-2">
                    <Send size={18} />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Email</h3>
                        <a
                          href="mailto:hello@periospot.com"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          hello@periospot.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Location</h3>
                        <p className="text-muted-foreground">
                          Geneva, Switzerland
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Phone</h3>
                        <p className="text-muted-foreground">
                          Available upon request
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Follow Us
                  </h2>
                  <div className="flex gap-4">
                    {[
                      { icon: Linkedin, label: "LinkedIn", href: "#" },
                      { icon: Twitter, label: "Twitter", href: "#" },
                      { icon: Instagram, label: "Instagram", href: "#" },
                      { icon: Youtube, label: "YouTube", href: "#" },
                    ].map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="p-3 bg-secondary/50 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        aria-label={social.label}
                      >
                        <social.icon size={24} />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Support Periospot */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8">
                  <h2 className="font-display text-xl font-bold text-foreground mb-3">
                    Support Periospot
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Become a Patron and get exclusive access to premium content, 
                    presentations, and much more.
                  </p>
                  <Button variant="outline" className="gap-2">
                    Become a Patron
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Team;
