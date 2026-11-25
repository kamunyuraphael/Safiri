import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ScrollToHash } from "@/components/common/ScrollToHash";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Home } from "@/pages/Home";
import { DestinationsPage } from "@/pages/DestinationsPage";
import { DestinationDetailPage } from "@/pages/DestinationDetailPage";
import { ItinerariesPage } from "@/pages/ItinerariesPage";
import { ItineraryEditorPage } from "@/pages/ItineraryEditorPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToHash />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/itineraries" element={<ItinerariesPage />} />
                <Route path="/itineraries/new" element={<ItineraryEditorPage />} />
                <Route path="/itineraries/:id" element={<ItineraryEditorPage />} />
              </Route>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
