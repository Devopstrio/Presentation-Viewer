import sys
import os
import win32com.client

def convert_to_pdf(input_path, output_path):
    input_path = os.path.abspath(input_path)
    output_path = os.path.abspath(output_path)
    
    # Ensure PowerPoint is opened
    powerpoint = win32com.client.Dispatch("PowerPoint.Application")
    try:
        # Open presentation: FilePath, ReadOnly=True, Untitled=False, WithWindow=False (0)
        presentation = powerpoint.Presentations.Open(input_path, WithWindow=0)
        # Format Type 32 is ppSaveAsPDF
        presentation.SaveAs(output_path, 32)
        presentation.Close()
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)
    finally:
        # Quit PPT Application
        try:
            powerpoint.Quit()
        except:
            pass

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_ppt.py <input_ppt> <output_pdf>")
        sys.exit(1)
    convert_to_pdf(sys.argv[1], sys.argv[2])
