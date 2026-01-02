import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ArticlesSpanish from "./pages/articles/ArticlesSpanish";
import ArticlesPortuguese from "./pages/articles/ArticlesPortuguese";
import ArticlesChinese from "./pages/articles/ArticlesChinese";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Assessments from "./pages/Assessments";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Library from "./pages/Library";
import Resources from "./pages/Resources";
import Workstation from "./pages/resources/Workstation";
import Apps from "./pages/resources/Apps";
import Patrons from "./pages/resources/Patrons";
import WebinarsToolkit from "./pages/resources/WebinarsToolkit";
import OnlineLearning from "./pages/OnlineLearning";
import Team from "./pages/Team";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import NotFound from "./pages/NotFound";
import LegacyPage from "@/components/LegacyPage";
import LegacyCategoryPage from "@/pages/LegacyCategoryPage";
import { legacyCategoryRoutes, legacyPageRoutes, legacyPages } from "@/data/legacyPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/articles" element={<Blog />} />
          <Route path="/articles/:slug" element={<BlogPost />} />
          <Route path="/articles/spanish/:slug" element={<BlogPost />} />
          <Route path="/articles/portuguese/:slug" element={<BlogPost />} />
          <Route path="/articles/chinese/:slug" element={<BlogPost />} />
          <Route path="/articles/spanish" element={<ArticlesSpanish />} />
          <Route path="/articles/portuguese" element={<ArticlesPortuguese />} />
          <Route path="/articles/chinese" element={<ArticlesChinese />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/spanish" element={<Library />} />
          <Route path="/library/portuguese" element={<Library />} />
          <Route path="/library/chinese" element={<Library />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/workstation" element={<Workstation />} />
          <Route path="/resources/apps" element={<Apps />} />
          <Route path="/resources/patrons" element={<Patrons />} />
          <Route path="/resources/webinars-toolkit" element={<WebinarsToolkit />} />
          <Route path="/online-learning" element={<OnlineLearning />} />
          <Route path="/team" element={<Team />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/:slug" element={<Assessments />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/home" element={<Index />} />
          <Route path="/homepage" element={<Index />} />
          <Route path="/blog-espanol" element={<ArticlesSpanish />} />
          <Route path="/articles-in-chinese" element={<ArticlesChinese />} />
          <Route path="/artigos-portugues" element={<ArticlesPortuguese />} />
          <Route path="/libreria-periospot-en-espanol" element={<Library />} />
          <Route path="/livraria-periospot-em-portugues" element={<Library />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/finalizar-compra" element={<Checkout />} />
          <Route path="/log-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/resources-center" element={<Resources />} />
          <Route path="/resources-center/periospot-accessories-shop" element={<Shop />} />
          <Route path="/ciscos-workstation" element={<Workstation />} />
          {legacyCategoryRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<LegacyCategoryPage {...route} />}
            />
          ))}
          {legacyPageRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<LegacyPage {...legacyPages[route.key]} />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
