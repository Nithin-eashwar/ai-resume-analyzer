import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import type { Route } from "./+types/home";
import { resumes } from "~/constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dreamjob!" },
  ];
}

export default function Home() {
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track your Applications and Resume Ratings</h1>
          <p>Review your submissions and check AI powered feedback</p>
        </div>
      </section>

      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </main>
  );
}
