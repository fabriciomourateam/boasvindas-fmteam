import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreatePage from "./pages/CreatePage";
import StudentPage from "./pages/StudentPage";
import TemplatesPage from "./pages/TemplatesPage";
import EditTemplate from "./pages/EditTemplate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/aluno/:slug" element={<StudentPage />} />

          {/* Admin */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/criar" element={<CreatePage />} />
          <Route path="/admin/editar/:id" element={<CreatePage />} />

          {/* Templates */}
          <Route path="/admin/templates" element={<TemplatesPage />} />
          <Route path="/admin/templates/criar" element={<EditTemplate />} />
          <Route path="/admin/templates/:id/editar" element={<EditTemplate />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
