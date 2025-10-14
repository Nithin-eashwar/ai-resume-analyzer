import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dreamjob!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      setIsLoading(true);

      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => {
        return JSON.parse(resume.value) as Resume;
      });

      setResumes(parsedResumes || []);
      setIsLoading(false);
    };

    loadResumes();
  });
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track your applications & Resume Ratings</h1>
          {!isLoading && resumes?.length === 0 ? (
            <h2>
              No resumes uploaded. Upload your first resume to get feedback
            </h2>
          ) : (
            <h2>Review your submissions and get AI-powered feedback</h2>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" alt="" className="w-[200px]" />
          </div>
        )}

        {!isLoading && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!isLoading && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 mt-10">
            <Link
              to="/upload"
              className="primary-button w-fit font-semibold text-lg"
            >
              Upload First Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
