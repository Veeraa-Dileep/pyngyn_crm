import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import DealsPage from './pages/deals';
import Dashboard from './pages/dashboard';
import Pipeline from './pages/pipeline';
import Pipelines from './pages/pipelines';
import HomePage from './pages/home';
import { MembersProvider } from './contexts/MembersContext';
import { PipelineProvider } from './contexts/PipelineContext';
import { DealsProvider } from './contexts/DealsContext';


const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <MembersProvider>
          <PipelineProvider>
            <DealsProvider>
              <ScrollToTop />
              <RouterRoutes>
                {/* Define your route here */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/Leads" element={<DealsPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pipelines" element={<Pipelines />} />
                <Route path="/pipeline/:pipelineId" element={<Pipeline />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="*" element={<NotFound />} />
              </RouterRoutes>
            </DealsProvider>
          </PipelineProvider>
        </MembersProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
