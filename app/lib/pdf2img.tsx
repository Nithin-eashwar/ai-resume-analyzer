export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

//these are state variables that are defined which are used to maintain state across multiple calls
//We make sure that the pdfjs library is loaded only once and reused for subsequent conversions
let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

//This is a lazy initialization function that loads the pdfjs library only when needed
async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module

  //This is a dynamic way of fetching the library only when needed

  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Set the worker source to use local file
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer(); //Used to read the files, but only in the binary format

    const pdf = await lib.getDocument({ data: arrayBuffer }).promise; //This takes the binary data and creates a PDF document object

    // Get the first page of the PDF
    const page = await pdf.getPage(1);

    //Creating a canvas element to render the PDF page
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    //We tell the pdf page object to draw itself on the canvas
    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      //This toBlob() function helps in converting the raw canvas into a blob/image file.
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob), //This creates a temporary URL for the image blob. This URL is stored in browsers local memory.
              //The url can be used in an img tag to display the image
              //However, this URL is not persistent and will be revoked when the page is refreshed or closed.
              //So, if you want to keep the image for longer, you need to upload it to a server or save it in a database.
              //Hence a temporary storage
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
