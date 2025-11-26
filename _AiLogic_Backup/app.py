from flask import Flask, redirect, request, jsonify, render_template
import os, requests, re, json
from email import policy
from email.parser import BytesParser
from langchain_community.chat_models import ChatOpenAI  # Import for chat model
from langchain.schema import HumanMessage
from dotenv import load_dotenv
import tempfile, time, shutil, logging, openai
from synonyms_mapping.synonym_mapper import SynonymMapper

# load_dotenv("/home/pragnakalpdev51/AiModel/.env")
# load_dotenv(".env")
load_dotenv()
app = Flask(__name__)
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

global OPENAI_API_KEY
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Get the current working directory (your project directory)
global project_dir
project_dir = os.getcwd()
print("CWD:",project_dir)

# Define paths relative to the project directory
paths = [
    os.path.join(project_dir, 'downloaded_JSON_files'),
    os.path.join(project_dir, 'AI_fetched_JSON_data'),
    os.path.join(project_dir, 'Debugging_Files'),
    os.path.join(project_dir, 'Dataset'),
    os.path.join(project_dir, 'Processed_JSON_files_Dataset')
]

# Ensure each directory exists
for path in paths:
    os.makedirs(path, exist_ok=True)

# Function to create the fine-tuning job
def create_fine_tuning_job(training_file_path: str, model: str):
    OPENAI_API_KEY
    try:
        # Upload the training file to OpenAI
        with open(training_file_path, 'rb') as file:
            response = openai.File.create(file=file, purpose='fine-tune')
        file_id = response['id']
        logger.info(f"Training file uploaded with ID: {file_id}")

        # Create fine-tuning job
        response = openai.FineTuningJob.create(training_file=file_id, model=model)
        job_id = response['id']
        logger.info(f"Fine-tuning job created with ID: {job_id}")

        return job_id

    except Exception as e:
        logger.error(f"Error creating fine-tuning job: {str(e)}")
        return None

# Function to monitor the fine-tuning job
def monitor_fine_tuning_job(job_id: str):
    try:
        response = openai.FineTuningJob.retrieve(job_id)
        return response

    except Exception as e:
        logger.error(f"Error monitoring fine-tuning job: {str(e)}")
        return None

# Function to monitor the fine-tuning job
def monitor_fine_tuning_job(job_id: str):
    try:
        response = openai.FineTuningJob.retrieve(job_id)
        return response

    except Exception as e:
        logger.error(f"Error monitoring fine-tuning job: {str(e)}")
        return None

# Function to fetch the latest fine-tuning status
def fetch_finetuning_status():
    url = "https://api.openai.com/v1/fine_tuning/jobs"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        response_data = response.json()
        # Save response data to a .json file
        with open(f"{os.path.join(project_dir, 'Debugging_Files')}/finetuning_status.json", "w") as file:
            json.dump(response_data, file, indent=2)
        # Sort by completion time to get the latest fine-tuned model
        jobs = sorted(response_data['data'], key=lambda x: x.get('created_at', 0), reverse=True)

        if jobs:
                latest_job = jobs[0]
                # print("latest job",latest_job)
                if latest_job['status'] == "succeeded":
                    model_name = latest_job.get('fine_tuned_model')
                    return model_name
                else:
                    model_name = latest_job.get('model')
                    return model_name
    else:
        print(f"Error fetching fine-tuning status: {response.status_code} - {response.text}")

        return "ft:gpt-4o-2024-08-06:atlas-fibre-rd::ARQ1I9w1"

# Initialize the model with the latest fine-tuned model name
current_model_name = fetch_finetuning_status()
llm = ChatOpenAI(
    openai_api_key=OPENAI_API_KEY,
    model_name=current_model_name,
    temperature=0
)

def load_synonym_mappings():
    """Load synonym mappings from the JSON file."""
    file_synonym_mapping = os.path.abspath(os.path.join('synonyms_mapping', "synonym_dictionary.json"))
    if os.path.exists(file_synonym_mapping):
        with open(file_synonym_mapping, 'r') as f:
            return json.load(f)
    return {}
    
# Initialize mapper with loaded data
synonym_mappings = load_synonym_mappings()
mapper = SynonymMapper(synonym_mappings)

# Save synonym mappings to JSON file
def save_synonym_mappings(mappings):
    # file_synonym_mapping = os.path.join(project_dir, '/synonyms_mapping/synonym_dictionary.json')
    file_synonym_mapping = os.path.abspath(os.path.join('synonyms_mapping', "synonym_dictionary.json"))
    with open(file_synonym_mapping, 'w') as f:
        json.dump(mappings, f, indent=4)

# List of valid colors
valid_colors = ["natural", "blue", "red", "pistachio", "yellow", "green", "brown", "black"]

# Columns for sheet, rod, and tube tables
sheet_columns = [
    "Line", "Grade", "Color", "Length", "Length + Tolerance", "Length - Tolerance", "Length Unit",
    "Width", "Width + Tolerance", "Width - Tolerance", "Width Unit",
    "Thickness", "Thickness + Tolerance", "Thickness - Tolerance", "Thickness Unit", "Number of Masked sides",
    "Number of Sanded Sides", "Grain Direction", "Quantity", "Quantity Unit", "Testing Required", "Domestic Material"
]

rod_columns = [
    "Line", "Grade", "Color", "Diameter", "Diameter + Tolerance", "Diameter - Tolerance", "Diameter Unit",
    "Length", "Length + Tolerance", "Length - Tolerance", "Length Unit",
    "Quantity", "Quantity Unit", "Testing Required", "Domestic Material"
]

tube_columns = [
    "Line", "Grade", "Color", "Outer Diameter", "Outer Diameter + Tolerance", "Outer Diameter - Tolerance", "Outer Diameter Unit",
    "Inner Diameter", "Inner Diameter + Tolerance", "Inner Diameter - Tolerance", "Inner Diameter Unit",
    "Length", "Length + Tolerance", "Length - Tolerance", "Length Unit",
    "Quantity", "Quantity Unit", "Testing Required", "Domestic Material"
]

# Function to replace synonyms with standard terms (without fuzzy matching)
def replace_synonyms(text):
    if text is None:
        return "unknown"

    # Replace "x" in dimensions with a placeholder to avoid replacing it as a synonym
    text = re.sub(r'(\d+)\s*[xX]\s*(\d+)', r'\1 _x_ \2', text)

    # Replace synonyms for the entire text, treating it as a single entity
    for standard, synonyms in synonym_mappings.items():
        # Check for exact matches
        if text.lower() in [syn.lower() for syn in synonyms]:
            text = standard
            break

    # Replace "nat" with "natural" if it appears where a color is expected
    if text.lower() == "nat":
        text = "natural"

    # Replace the placeholder back with "x"
    return text.replace('_x_', 'x')

# Function to determine if testing is required
def is_testing_required(content):
    if content is None:
        return False
    testing_terms = [
        "TEST REPORTS Required",
        "+ testing", "lot testing", "lot test", "certs", "certification",
        "material certification", "traceability", "must have traceability",
        "all materials must come with certification", "all material needs testing"
    ]
    return any(term in content.lower() for term in testing_terms)

# Function to determine if domestic material is required
def is_domestic_material_required(content):
    if content is None:
        return False
    domestic_terms = [
        "domestic", "dfars", "berry compliant",
        "material must be domestic", "all materials must be domestic"
    ]
    return any(term in content.lower() for term in domestic_terms)

# Function to ensure the color is valid, removing unnecessary descriptors
def validate_color(color):
    if color is None:
        return None
    color_words = color.lower().split()
    for word in color_words:
        if word in valid_colors:
            return word
    return None

# Function to parse an .eml file and extract its content
def parse_eml(file_path):
    if not os.path.exists(file_path):
        return {"error": "Error: File not found."}

    with open(file_path, 'rb') as f:
        msg = BytesParser(policy=policy.default).parse(f)

    # Extracting relevant information from the email
    subject = msg.get('subject', 'No Subject')
    from_address = msg.get('from', 'Unknown Sender')
    to_address = msg.get('to', 'Unknown Recipient')
    date = msg.get('date', 'Unknown Date')
    body = ''

    # Extract body content (plain text or HTML)
    if msg.is_multipart():
        for part in msg.iter_parts():
            if part.get_content_type() == 'text/plain':
                body = part.get_content()
                break
    else:
        body = msg.get_content()

    # Include subject line as part of the body for context
    full_content = f"Subject: {subject}\n\n{body}"

    return {
        "subject": subject,
        "from_address": from_address,
        "to_address": to_address,
        "date": date,
        "body": full_content
    }

# Function to send a customer request to OpenAI and get structured data
def send_to_ai_for_structuring(content):
    try:
        # Replace synonyms with standard terms
        # content = replace_synonyms(content)

        # Determine if testing is required based on the content
        testing_required = is_testing_required(content)

        # Determine if domestic material is required based on the content
        domestic_required = is_domestic_material_required(content)

        # Extract potential global context from the subject line
        subject_context = content.split('\n')[0]

        # Send the raw email content to the AI agent to structure the request into JSON
        prompt = f"""
        We are an organization that sells various grades of plastic in different forms—sheets, rods, tubes, and rings. Each quote is customized based on the customer’s request, which is often presented in unstructured email formats. To generate accurate quotes, we need to convert this information into a structured table format. Different materials and larger sizes have higher costs, so our columns include all the variables necessary for our quote configurator to deliver precise pricing. We receive quotation requests from customers via email.

        Extract the order details from the following email and format it into structured JSON data for cut pieces.
        The customer may request the same item multiple times but with different quantities.
        For each distinct request, generate a separate JSON entry with the following fields for sheets, rods, and tubes:

        For sheets: Grade, Color, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Width, Width + Tolerance, Width - Tolerance, Width Unit of Measure, Thickness, Thickness + Tolerance, Thickness - Tolerance, Thickness Unit of Measure, Number of Masked Sides, Number of Sanded Sides, Grain Direction, Quantity, Quantity Unit of Measure, Testing Required, Domestic Material.
        1. For the "Number of Masked Sides" key, identify if 'M1S' (Mask One Side) or 'M2S' (Mask Two Sides) is mentioned in the email content. Set the value to '1' if 'M1S' is present and '2' if 'M2S' is present.
        2. For the "Number of Sanded Sides" key, identify if 'S1S' or 'S2S' is mentioned in the email content. Set the value to '1' if 'S1S' is present and '2' if 'S2S' is present. Do not include 'S1S' or 'S2S' in the value, only the corresponding numeric quantity.

        For rods: Grade, Color, Diameter, Diameter + Tolerance, Diameter - Tolerance, Diameter Unit of Measure, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Quantity, Quantity Unit of Measure, Hex Rod, Rolled and Molded, Testing Required, Domestic Material.

        For rings or washers: rings or washers mentioned in email-body Grade, Color, Outer Diameter, Outer Diameter + Tolerance, Outer Diameter - Tolerance, Outer Diameter Unit of Measure, Inner Diameter, Inner Diameter + Tolerance, Inner Diameter - Tolerance, Inner Diameter Unit of Measure, Thickness, Thickness + Tolerance, Thickness - Tolerance, Thickness Unit of Measure, Quantity, Quantity Unit of Measure, Testing Required, Domestic Material, Flag_Ring.

        For tubes: Grade, Color, Outer Diameter, Outer Diameter + Tolerance, Outer Diameter - Tolerance, Outer Diameter Unit of Measure, Inner Diameter, Inner Diameter + Tolerance, Inner Diameter - Tolerance, Inner Diameter Unit of Measure, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Quantity, Quantity Unit of Measure, Testing Required, Domestic Material.

        Use the subject line as a potential source for global attributes like shape, grade, thickness, or any other details that apply to the entire order.
        If the email contains "or" when describing items or quantities, treat each option as a separate line item. For example:
        "4, 5, or 7 pieces" should be quoted as three separate lines, one for 4 pieces, one for 5 pieces, and one for 7 pieces.
        "G10 or FR4" should be quoted as two separate lines, one for G10 and one for FR4.
        If the customer specifies both domestic and import options, create multiple entries with "domestic material" set to "true" and "false" accordingly.(In json true and false value must be in string)
        Additionally, if a customer specifies a wall thickness and an outer or inner diameter, calculate and provide both the inner and outer diameters in the response.

        If the tolerance value is present and not zero, the model must strictly append a '+' sign for fields like 'diameter + tolerance' and a '-' sign for fields like 'inner diameter - tolerance.' The model must not perform any arithmetic and should only append these signs ('+' or '-') to the values as instructed. If the tolerance value is zero or not provided in the email, no signs should be added. The model must strictly adhere to the rule that if no tolerance information is provided in the content, the tolerance field must be left blank and no value should be assigned.

        If the email content contains the following color codes: 'nat' or 'natu', set the "color" key value to "Natural"; if it contains 'blk', set the "color" key value to "black"; and if it contains 'grn', set the "color" key value to "green." If no color is mentioned in the email, leave the "color" key empty or omit it from the output.

        If the email content contains fractional values such as '1/8' or '1 1/4,' convert them to their decimal equivalents. For example, '1/8' should be converted to '0.125' and '1 1/8' should be converted to '1.125' before displaying on the GUI.

        For "testing required" set the value to "true" if the email content includes any of the following phrases: "TEST REPORTS Required," "+ testing," "lot testing," "lot test," "certs," "certification," "material certification," "traceability," "must have traceability," "all materials must come with certification," or "all material needs testing."

        For the 'Hex Rod' column, add a Boolean field Hex Rod for rods. Set this field to true only if the customer explicitly mentions 'hex' or 'hex rod' in the description; otherwise, set it to false.

        For the 'rolled and molded' column in rods, set it to 'true' if the email content contains any of the following phrases: 'Molded rod,' 'rolled rod,' or 'rolled and molded' for a rod. If none of these phrases are present, set it to 'false.'

        For "domestic material," set the value to "true" if the email content includes phrases such as "domestic," "DFARS," "Berry compliant," "material must be domestic," or "all materials must be domestic."

        Classify an item as a 'washer' or 'ring' only if the description explicitly mentions 'washer' or 'ring.' Classify all other items based on their description, ensuring tubes are not misclassified as washers or rings unless explicitly stated.

        Do not repeat or duplicate values for any items that have the same details, even if they are mentioned multiple times in the email only add them once.

        When a range is specified for Length, Width, Thickness, Diameter, Outer Diameter, or Inner Diameter, select the nominal midpoint as the target value, ensuring measurements stay within the customer’s minimum and maximum limits. If a tolerance range is included, use the midpoint of that tolerance range as well. If no tolerance range is provided, apply the given value directly, and omit any tolerance if it’s not specified.

        For quantity unit of measure, when extracting quantity, represent it as a numeric value without appending terms like 'total' or 'overall'. For quantity units, use specific material units (such as pieces, sheets, rods, etc.) and avoid general terms. Only include standard measurement units for dimensions and quantities.

        For Grade mapping, use the dictionary {synonym_mappings} to assign the appropriate grade to sheets, rods, tubes, and rings.

        Identify all grade types from the email content by checking each term separately against each entry in the synonym mappings. For each grade term identified, independently add the grade to the list if it has a match within the mappings. Make sure that each term is compared exhaustively to capture multiple matches. For example, if 'G11' is there one grade is 'G11' and along with this 'MIL-I-24768/28 (GEB-F)' appears, it should trigger 'FR5' also based on the mappings, so both should be listed in 'Grades' as separate items. Double-check that the final list contains all grades linked to each detected term, ensuring completeness without missing any applicable grades. Also when responding to requests that mention 'G10' or 'G-10,' treat them as if they asked for both 'G10'

        You need to send a JSON object with the following structure:
        {{
            "sheet_value": [
            {{ "key": "value" }},
            {{ "key": "value2" }}
            ],
            "rod_value": [
            {{ "key": "value" }}
            ],
            "tube_value": [
            {{ "key": "value" }}
            ],
            "ring_value": [
            {{ "key": "value" }}
            ]
        }}
        Ensure there is no additional text or explanation before or after the JSON.
        Email content: \n\n{content}
        """
        
        response = llm.invoke([HumanMessage(content=prompt)])
        # print("Scratch Response", response)
        cleaned_response = response.content.strip().strip('```').strip('json')

        print("")
        print("cleaned_response",cleaned_response)
        print("")
        ft_model_response = False
        # Pretty print JSON for better readability
        try:
            # Try parsing the response as a single JSON
            parsed_json = json.loads(cleaned_response)
            # print("parsed_json",parsed_json)
            with open(f"{os.path.join(project_dir, 'Debugging_Files')}/Model_response.json", "w+") as file:
                json.dump(parsed_json, file, indent=4)
        except json.JSONDecodeError as jde:
            # If there is an extra data error, handle multiple JSON objects
            try:
                # Split response by assuming multiple JSON objects
                json_objects = [json.loads(obj) for obj in cleaned_response.split('\n') if obj.strip()]
                parsed_json = json_objects
            except json.JSONDecodeError as jde_inner:
                # ai_response_text.insert(tk.END, f"JSON parsing error: {str(jde_inner)}\n")
                # ai_response_text.insert(tk.END, "Debugging Info: AI Response Content was:\n" + response.content + "\n")
                try:
                    with open(f"{os.path.join(project_dir, 'Debugging_Files')}/Model_response.json", "w+") as file:
                        json.dump(cleaned_response, file, indent=4)
                        ft_model_response = True
                except Exception as e:
                    return

        final_items = []
        if ft_model_response==False:
            for key, items in parsed_json.items():
                for item in items:
                # Replace synonyms in the "grade" field for sheets, rods, and tubes
                    if "grade" in item:
                        item["grade"] = replace_synonyms(item["grade"])

                    # Ensure color is valid
                    if "color" in item:
                        item["color"] = validate_color(item["color"])
                    # Append the original item
                    final_items.append(item)

            # Remove duplicate entries by using a set of unique tuples
            unique_items = [dict(t) for t in {tuple(sorted(d.items())) for d in final_items}]

            # Format the result into JSON
            formatted_json = json.dumps(unique_items, indent=4)
            try:
                # Ensure the formatted JSON is valid by parsing it back to an object
                formatted_json = json.loads(formatted_json)
            except json.JSONDecodeError as jde_final:
                # Handle potential JSON errors in the final formatting step
                return f"Final formatting error: {str(jde_final)}\n"

            return parsed_json, unique_items, formatted_json, ft_model_response
        else:
            unique_items = []
            ft_model_response = True
            return cleaned_response, unique_items, cleaned_response, ft_model_response
    except Exception as e:
        print("Error: ", e)
        return e

# Function to display the parsed JSON in separate tables for sheets, rods, and tubes
def display_parsed_json_in_tables(parsed_json):
    sheet_value = []
    rod_value = []
    tube_value = []
    ring_value = []
    # tolerance = 0.05  # Tolerance value
    # Iterate through each JSON object and add it to the appropriate table
    for idx, item in enumerate(parsed_json, start=1):
        try:

            if "thickness" in item:  # This is a sheet item
                # # Calculate length and width tolerances
                # length = float(item.get("length", 0) or 0)
                # width = float(item.get("width", 0) or 0)
                # thickness = float(item.get("thickness", 0) or 0)

                values = {
                    # "Line": idx,
                    "Grade": item.get("grade", ""),
                    "Color": item.get("color", ""),
                    "Length": item.get("length", ""),  # Display original length
                    "Length + Tolerance": item.get("length + tolerance", ""),  # Length + tolerance
                    "Length - Tolerance": item.get("length - tolerance", ""),  # Length - tolerance
                    "Length Unit": item.get("length unit of measure", ""),
                    "Width": item.get("width", ""),  # Display original width
                    "Width + Tolerance": item.get("width + tolerance", ""),  # Width + tolerance
                    "Width - Tolerance": item.get("width - tolerance", ""),  # Width - tolerance
                    "Width Unit": item.get("width unit of measure", ""),
                    "Thickness": item.get("thickness", ""),
                    "Thickness + Tolerance": item.get("thickness + tolerance", ""),
                    "Thickness - Tolerance": item.get("thickness - tolerance", ""),
                    "Thickness Unit": item.get("thickness unit of measure", ""),
                    "Number of Masked sides": item.get("number of masked sides", ""),
                    "Number of Sanded Sides": item.get("number of sanded sides", ""),
                    "Grain Direction": item.get("grain direction", ""),
                    "Quantity": item.get("quantity", ""),
                    "Quantity Unit": item.get("quantity unit of measure", ""),
                    "Testing Required": item.get("testing required", ""),
                    "Domestic Material": item.get("domestic material", "")
                }
                sheet_value.append(values)

            elif "diameter" in item and "inner diameter" not in item:  # This is a rod item
                # # Calculate length tolerance
                # length = float(item.get("length", 0) or 0)
                # diameter = float(item.get("diameter", 0) or 0)

                values = {
                    # "Line": idx,
                    "Grade": item.get("grade", ""),
                    "Color": item.get("color", ""),
                    "Diameter": item.get("diameter", ""),
                    "Diameter + Tolerance": item.get("diameter + tolerance", ""),
                    "Diameter - Tolerance": item.get("diameter - tolerance", ""),
                    "Diameter Unit": item.get("diameter unit of measure", ""),
                    "Length": item.get("length", ""), # Display original length
                    "Length + Tolerance": item.get("length + tolerance", ""),  # Length + tolerance
                    "Length - Tolerance": item.get("length - tolerance", ""),  # Length - tolerance
                    "Length Unit": item.get("length unit of measure", ""),
                    "Quantity": item.get("quantity", ""),
                    "Quantity Unit": item.get("quantity unit of measure", ""),
                    "Hex Rod":item.get("hex rod", ""), 
                    "Rolled and Molded": item.get("rolled and molded", ""),
                    "Testing Required": item.get("testing required", ""),
                    "Domestic Material": item.get("domestic material", "")
                    }
                rod_value.append(values)

            elif "outer diameter" in item and "inner diameter" in item:  # This is a tube item
                # # Calculate length tolerance
                # length = float(item.get("length", 0) or 0)
                # outer_diameter = float(item.get("outer diameter", 0) or 0)
                # inner_diameter = float(item.get("inner diameter", 0) or 0)
                if "flag_ring" in item:
                    values = {
                    # "Line": idx,
                    "Grade": item.get("grade", ""),
                    "Color": item.get("color", ""),
                    "Outer Diameter": item.get("outer diameter", ""),
                    "Outer Diameter + Tolerance": item.get("outer diameter + tolerance", ""),
                    "Outer Diameter - Tolerance": item.get("outer diameter - tolerance", ""),
                    "Outer Diameter Unit": item.get("outer diameter unit of measure", ""),
                    "Inner Diameter": item.get("inner diameter", ""),
                    "Inner Diameter + Tolerance": item.get("inner diameter + tolerance", ""),
                    "Inner Diameter - Tolerance": item.get("inner diameter - tolerance", ""),
                    "Inner Diameter Unit": item.get("inner diameter unit of measure", ""),
                    "Thickness": item.get("Thickness", ""),  # Display original Thickness
                    "Thickness + Tolerance": item.get("Thickness + tolerance", ""),  # Thickness + tolerance
                    "Thickness - Tolerance": item.get("Thickness - tolerance", ""),  # Thickness - tolerance
                    "Thickness Unit": item.get("Thickness unit of measure", ""),
                    "Quantity": item.get("quantity", ""),
                    "Quantity Unit": item.get("quantity unit of measure", ""),
                    "Testing Required": item.get("testing required", ""),
                    "Domestic Material": item.get("domestic material", "")
                    }
                    ring_value.append(values)
                else:
                    values = {
                        # "Line": idx,
                        "Grade": item.get("grade", ""),
                        "Color": item.get("color", ""),
                        "Outer Diameter": item.get("outer diameter", ""),
                        "Outer Diameter + Tolerance": item.get("outer diameter + tolerance", ""),
                        "Outer Diameter - Tolerance": item.get("outer diameter - tolerance", ""),
                        "Outer Diameter Unit": item.get("outer diameter unit of measure", ""),
                        "Inner Diameter": item.get("inner diameter", ""),
                        "Inner Diameter + Tolerance": item.get("inner diameter + tolerance", ""),
                        "Inner Diameter - Tolerance": item.get("inner diameter - tolerance", ""),
                        "Inner Diameter Unit": item.get("inner diameter unit of measure", ""),
                        "Length": item.get("length", ""),  # Display original length
                        "Length + Tolerance": item.get("length + tolerance", ""),  # Length + tolerance
                        "Length - Tolerance": item.get("length - tolerance", ""),  # Length - tolerance
                        "Length Unit": item.get("length unit of measure", ""),
                        "Quantity": item.get("quantity", ""),
                        "Quantity Unit": item.get("quantity unit of measure", ""),
                        "Testing Required": item.get("testing required", ""),
                        "Domestic Material": item.get("domestic material", "")
                        }
                    tube_value.append(values)

        except ValueError:
            # Handle the case where length or width could not be converted to float
            print(f"Error processing item at index {idx}: Invalid length or width value.")
        except Exception as e:
            print(f"Error processing item at index {idx}: {str(e)}")

    return sheet_value, rod_value, tube_value, ring_value

def upload_eml(email_data):
    # email_data = request.get_json()
    # print(email_data)  # Retrieve the JSON data sent by the client

    if not email_data or 'body' not in email_data:
        return jsonify({'error': 'Invalid email data'}), 400
    try:
        print(email_data)
    except Exception as e:
        print("Error:", e)

    # structured_data, unique_items, formatted_json = send_to_ai_for_structuring(email_data['body'])
    structured_data, unique_items, formatted_json, ft_model_response = send_to_ai_for_structuring(email_data['body'])
    if ft_model_response == False:

        print(">>>>structured_data:",structured_data)

        json_response = {'email_data': email_data, 'AI_Response': structured_data}
        return json_response
    else:
        data_str = structured_data.strip()
        while data_str.count('}') > data_str.count('{'):
            # Remove the last character if it's a closing brace
            data_str = data_str[:-1]
        
        # Dynamically handle based on the presence of single or double quotes
        if "'" in data_str and '"' not in data_str:
            # It's likely a Python dictionary format (single quotes)
            try:
                # Use ast.literal_eval to safely convert to a dictionary
                quoted_data_str = str(data_str).replace("'", '"')
                # quoted_data_str = ast.literal_eval(data_str)
            except (ValueError, SyntaxError) as e:
                print("Error parsing data as dictionary:", e)
                return {"error": "Invalid data format"}
            
        print("quoted data str", quoted_data_str)
        data_json = json.loads(quoted_data_str)
        json_response = {'email_data': email_data, 'AI_Response': data_json}
        return json_response

def create_dataset(json_data, time_stamp, dataset_list:list):
    # print(">>>>>>Josn Data<<<<<<<<",json_data)
    email_content = json_data.get("email_data")
    # material_data = json_data.get("AI_Response")
    updated_content = {
        "sheet_value": json_data.get("sheet_value", []),
        "rod_value": json_data.get("rod_value", []),
        "tube_value": json_data.get("tube_value", []),
        "ring_value": json_data.get("ring_value", []),
    }

    # print(">>>>>>>>>>>>>>>>>>>>>>>>",updated_content,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,")

    system_content = f"You are tasked with extracting structured JSON data for custom quotes from customer emails. Each email contains unstructured details about an order, such as material type, dimensions, and specifications, which should be transformed into a structured format based on the item type (sheets, rods, tubes, rings, or washers). Please adhere to the following format guidelines:- For **sheets**: Extract Grade, Color, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Width, Width + Tolerance, Width - Tolerance, Width Unit of Measure, Thickness, Thickness + Tolerance, Thickness - Tolerance, Thickness Unit of Measure, Number of Masked Sides, Number of Sanded Sides, Grain Direction, Quantity, Quantity Unit of Measure, Testing Required, and Domestic Material. For 'Number of Masked Sides,' set '1' for 'M1S' and '2' for 'M2S'; for 'Number of Sanded Sides,' set '1' for 'S1S' and '2' for 'S2S' based on the email content, using only numeric values.- For **rods**: Extract Grade, Color, Diameter, Diameter + Tolerance, Diameter - Tolerance, Diameter Unit of Measure, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Quantity, Quantity Unit of Measure, Hex Rod, Rolled and Molded, Testing Required, and Domestic Material.- For **rings or washers**: Specify `Flag_Ring` with 'rings' or 'washer' and extract Grade, Color, Outer Diameter, Outer Diameter + Tolerance, Outer Diameter - Tolerance, Outer Diameter Unit of Measure, Inner Diameter, Inner Diameter + Tolerance, Inner Diameter - Tolerance, Inner Diameter Unit of Measure, Thickness, Thickness + Tolerance, Thickness - Tolerance, Thickness Unit of Measure, Quantity, Quantity Unit of Measure, Testing Required, and Domestic Material.- For **tubes**: Extract Grade, Color, Outer Diameter, Outer Diameter + Tolerance, Outer Diameter - Tolerance, Outer Diameter Unit of Measure, Inner Diameter, Inner Diameter + Tolerance, Inner Diameter - Tolerance, Inner Diameter Unit of Measure, Length, Length + Tolerance, Length - Tolerance, Length Unit of Measure, Quantity, Quantity Unit of Measure, Testing Required, and Domestic Material.**General Rules:**- Extract each distinct item as a separate JSON entry.- If multiple quantities or options (e.g., '4 or 5 pieces') are provided, create separate entries for each option.- Map specific color codes ('nat' or 'natu' as 'Natural,' 'blk' as 'black,' 'grn' as 'green').- Convert fractional dimensions (e.g., '1/8' to '0.125') to decimals.- Detect 'testing required' from keywords like 'certification,' 'traceability,' or 'lot test.'- Use the term 'domestic material' if keywords like 'DFARS' or 'Berry compliant' are found.- For grade mapping, use synonym mappings provided to match any recognized terms in the email to their corresponding grades. For the specified column, add a Boolean field that indicates a specific attribute. Set this field to true only if the description explicitly mentions certain keywords; otherwise, set it to false. List all applicable grades if multiple synonyms match.**Tolerance Handling (STRICT INSTRUCTION):**The length, width, and thickness values are extracted from the email, and the +tolerance and -tolerance values are added to the respective fields. The number of sanded sides is set to '2' based on the S2S information in the email. Adhere strictly to the rule: if no tolerance information is provided in the content, leave the tolerance field blank and do not assign any value.**Output Structure:** Return a JSON object with lists for each item type in the following format: {{'sheet_value': [{{'key': 'value'}}], 'rod_value': [{{'key': 'value'}}], 'tube_value': [{{'key': 'value'}}], 'ring_value': [{{'key': 'value'}}]}} Output only the JSON structure without any additional text."

    dataset_content = {"messages": [{"role": "system", "content": f"{system_content}"}, {"role": "user", "content": f"{email_content}"}, {"role": "assistant", "content": f"{updated_content}"}]}
    # print(dataset_content)
    dataset_list.append(dataset_content)
    file_name = f"{os.path.join(project_dir, 'Dataset')}/dataset_{time_stamp}.jsonl"
    with open(file_name, "a") as f:
        json.dump(dataset_content, f, sort_keys=False)
        f.write('\n')
        
    # print("bye")
    return dataset_list, file_name

@app.route('/', methods=["GET", "POST"])
def index():
    return render_template('index.html')

@app.route('/upload_eml_file', methods=['POST'])
def send_eml_file():
    global llm  # To reassign llm if model_name changes

    # Fetch the latest fine-tuned model name before processing
    latest_model_name = fetch_finetuning_status()
    # latest_model_name = "ft:gpt-4o-2024-08-06:atlas-fibre-rd::APkv0bCl"
    print("+++++Fetched model name+++++++")
    print(latest_model_name)
    if latest_model_name and latest_model_name != llm.model_name:
        llm = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY,
            model_name=current_model_name,
            temperature=0
        )

    print(request.files)
    # Check if the POST request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    print(">>file", file)

    # If no file is selected
    filename = file.filename
    if filename == '':
        return jsonify({'error': 'No selected file'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.eml') as temp_file:
        temp_file.write(file.read())
        file_path = temp_file.name
        print(file_path)

    email_data = parse_eml(file_path)

    # print(email_data)
    # Send the POST request with the file
    json_data = upload_eml(email_data)
    # Save the JSON data to a file for future access

    file_name = filename.replace(".eml", "")
    file_path = f"{os.path.join(project_dir, 'AI_fetched_JSON_data')}/{file_name}.json"
    with open(file_path, "w") as file:
        json.dump(json_data, file, indent=4)

    return jsonify({'message': 'File uploaded and processed successfully!'}), 200

@app.route('/get_data', methods=['GET', 'POST'])
def get_data():
    filename = request.args.get('filename')  # Get the filename from the query parameter
    directory_name = request.args.get('directoryname')

    if not filename:
        return jsonify({'error': 'Filename parameter is missing'}), 400
    
    if directory_name:
        file_path = os.path.abspath(os.path.join(directory_name, f"{filename}.json"))
        # file_path = f"./{directory_name}/{filename}.json"
    else:
        file_path = f"./AI_fetched_JSON_data/{filename}.json"
    try:
        with open(file_path) as f:
            json_data = json.load(f)
        # If a directory name is provided, render the data directly to index.html
        if directory_name:
            # return render_template('index.html', data=json_data)
            return jsonify({"data":json_data, "filename":f"{filename}.json" })
            # return jsonify({"filename":f"{filename}.json"})
        else:
            return jsonify(json_data)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

#route to handle saving data
@app.route('/save_data', methods=['POST'])
def save_data():
    try:
        # Get JSON data and filename from the request
        data = request.get_json()
        filename = request.args.get('filename')
        if not filename:
            return jsonify(message="Filename parameter is missing."), 400

        # Define the path to save the JSON file
        json_file_path = os.path.join(os.path.join(project_dir, 'downloaded_JSON_files'), f'{filename}.json')

        # Save the JSON data to the file
        with open(json_file_path, 'w') as f:
            json.dump(data, f, indent=4)

        return jsonify(message="Data saved successfully."), 200
    except Exception as e:
        print(f"Error saving data: {e}")
        return jsonify(message="Failed to save data."), 500

@app.route('/file_operations', methods=["POST", "GET"])
def file_operations():
    directory = os.path.join(project_dir, 'downloaded_JSON_files')
    global dataset_file
    try:
        # List files in the directory
        files = os.listdir(directory)
        time_stamp = time.time()
        dataset_lst = []

        if request.method == "POST":
            # Check if fine-tuning is requested
            start_fine_tuning = request.json.get("start_fine_tuning", False)

            count = 0
            for name in files:
                # Open file
                with open(os.path.join(directory, name)) as f:
                    # Read content of file
                    json_file_data = f.read()
                    data_content = json.loads(json_file_data)
                    # print(data_content)
                    # To create a dataset
                    dataset_lst, dataset_file = create_dataset(json_data=data_content, time_stamp=time_stamp, dataset_list=dataset_lst)
                    count += 1

            print(f"Total files processed: {count}")
            print(f"Dataset file created at: {dataset_file}")

            # Check if fine-tuning should start
            if start_fine_tuning:
                OPENAI_API_KEY
                # Create a timestamped directory for processed files
                destination_new_dir = f"{os.path.join(project_dir, 'Processed_JSON_files_Dataset')}/{time_stamp}"
                os.makedirs(destination_new_dir, exist_ok=True)

                # Move each file to the new directory
                for f in files:
                    src_path = os.path.join(directory, f)
                    dst_path = os.path.join(destination_new_dir, f)
                    shutil.move(src_path, dst_path)
                    print(f"Moved file: {f}")

                model_name = llm.model_name
                print("++++++++++++++++++++++ Model for Finetuning ++++++++++++++++++++++++++")
                print(model_name)
                print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

                # Start the fine-tuning job with dataset
                job_id = create_fine_tuning_job(dataset_file, model=model_name)
                # job_id = None
                if job_id:
                    # Monitor the fine-tuning job
                    status = monitor_fine_tuning_job(job_id)
                    logger.info(f"Fine-tuning job status: {status}")
                    # Return dataset information and fine-tuning status to the client
                    return jsonify({
                        'message': 'Dataset created and fine-tuning started',
                        'file_name': dataset_file,
                        'data': dataset_lst,
                        'job_id': job_id,
                        'status': status
                    }), 200
                else:
                    return jsonify({'error': 'Failed to start fine-tuning job'}), 500

            # If fine-tuning is not started, return dataset creation message only
            return jsonify({
                'message': 'Dataset created successfully',
                'file_name': dataset_file,
                'data': dataset_lst
            }), 200

        return jsonify({'message': 'Files processed successfully', 'files': files})
    except Exception as e:
        logger.error(f"Error in file_operations: {str(e)}")
        return jsonify({'error': str(e), 'message': 'Failed to process files'}), 500

@app.route('/add_synonym', methods=['POST'])
def add_synonym():
    # To add a new synonym to a specific grade
    data = request.json
    grade = data.get('grade')
    new_synonym = data.get('synonym')

    # Check if the grade is provided
    if grade:
        existing_synonyms = mapper.synonym_mappings.get(grade, [])

        # If it's a completely new grade, initialize with the grade itself as the first synonym
        if grade not in mapper.synonym_mappings:
            mapper.synonym_mappings[grade] = [grade]  # Start with grade as its own synonym
            existing_synonyms = mapper.synonym_mappings[grade]

        # If a new synonym is provided and it's not already in the list, add it
        if new_synonym:
            if new_synonym not in existing_synonyms:
                mapper.add_synonyms(grade, [new_synonym])
                save_synonym_mappings(mapper.synonym_mappings)
                return jsonify({"message": "Grade and synonym added successfully"}), 200
            else:
                return jsonify({"message": "Synonym already exists for this grade"}), 200
        else:
            # Save just the new grade if no synonym was provided
            save_synonym_mappings(mapper.synonym_mappings)
            return jsonify({"message": "New grade added successfully"}), 200
    else:
        return jsonify({"error": "Grade is missing"}), 400

@app.route('/synonyms_mapping', methods=['GET', 'POST'])
def synonym_data():
    return render_template('synonums_mapping.html', grades=load_synonym_mappings())

@app.route('/api/grades', methods=['GET'])
def get_grades():
    return jsonify(load_synonym_mappings())

@app.route('/api/grades', methods=['POST'])
def add_grade():
    data = load_synonym_mappings()
    new_grade = request.json.get('grade')
    if new_grade and new_grade not in data:
        data[new_grade] = []
        save_synonym_mappings(data)
        return jsonify({'success': True, 'message': 'Grade added successfully'})
    return jsonify({'success': False, 'message': 'Grade already exists or invalid'})

@app.route('/api/grades/<grade>', methods=['DELETE'])
def delete_grade(grade):
    data = load_synonym_mappings()
    if grade in data:
        del data[grade]
        save_synonym_mappings(data)
        return jsonify({'success': True, 'message': 'Grade deleted successfully'})
    return jsonify({'success': False, 'message': 'Grade not found'})

@app.route('/api/grades/<grade>/synonyms', methods=['POST'])
def add_synonym_mapping(grade):
    data = load_synonym_mappings()
    synonym = request.json.get('synonym')
    if grade in data and synonym and synonym not in data[grade]:
        data[grade].append(synonym)
        save_synonym_mappings(data)
        return jsonify({'success': True, 'message': 'Synonym added successfully'})
    return jsonify({'success': False, 'message': 'Invalid grade or synonym'})

@app.route('/api/grades/<grade>/synonyms/<int:index>', methods=['DELETE'])
def delete_synonym(grade, index):
    data = load_synonym_mappings()
    if grade in data and 0 <= index < len(data[grade]):
        data[grade].pop(index)
        save_synonym_mappings(data)
        return jsonify({'success': True, 'message': 'Synonym deleted successfully'})
    return jsonify({'success': False, 'message': 'Invalid grade or synonym index'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)  