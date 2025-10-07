import Navbar from "~/components/Navbar";
import { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { i } from "node_modules/@react-router/dev/dist/routes-CZR-bKRt";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    // Handle file selection
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading and analyzing your resume...");

    //uploading the file to puter
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) setStatusText("File upload failed. Please try again.");

    setStatusText("Converting to image ...");
    //Calling the pdf2img function to convert the pdf to image
    //This function returns a Promise which resolves to a File object (image)
    const imageFile = await convertPdfToImage(file);

    if (!imageFile)
      setStatusText("PDF to Image conversion failed. Please try again.");
    setStatusText("Uploading the image ...");

    //This then uploads the image to puter
    const uploadedImage = await fs.upload([imageFile.file!]);
    if (!uploadedImage) setStatusText("Image upload failed. Please try again.");

    setStatusText("Preparing Data ...");
    const uuid = generateUUID();

    //Preparing the data to be stored in the KV store
    //The key will be resume:uuid
    //The value will be a JSON string containing the resume details
    const data = {
      id: uuid,
      resumePath: uploadedFile?.path,
      imagePath: uploadedImage?.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };

    //Storing the data into puter
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Generating AI Feedback ...");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your Dream Job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" alt="resume-scan" />
            </>
          ) : (
            <h2>Drop your resume for ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              action=""
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  id="company-name"
                  name="company-name"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  id="job-title"
                  name="job-title"
                  placeholder="Enter job title"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={6}
                  id="job-description"
                  name="job-description"
                  placeholder="Enter job description"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                {/*This onFileSelect is a typeScript callback function which needs to be sent to the component.
                This is mentioned in the FileUploaderProps. Returns a void */}
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
