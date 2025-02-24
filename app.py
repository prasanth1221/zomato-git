import os
import json

# Directory containing JSON files
json_dir = 'D:\\projects\\Zomato-WebApp\\archive (5)'  # Change this to your directory path

# List all JSON files in the directory
json_files = [f for f in os.listdir(json_dir) if f.endswith(".json")]

merged_data = []

# Read and merge all JSON files
for file in json_files:
    file_path = os.path.join(json_dir, file)
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        merged_data.extend(data if isinstance(data, list) else [data])  # Ensure list format

# Save the merged JSON data
output_file = "merged_data.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(merged_data, f, indent=4)

print(f"Merged JSON saved as {output_file} with {len(merged_data)} records.")
