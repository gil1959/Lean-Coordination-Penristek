from PIL import Image, ImageDraw

def remove_white_bg(input_path, output_path, tolerance=25):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Save as PNG
    img.save(output_path, "PNG")
    
    # Also save a resized version for favicon
    favicon = img.resize((32, 32), Image.Resampling.LANCZOS)
    favicon.save("public/favicon.ico", format="ICO")
    print("Done")

if __name__ == "__main__":
    remove_white_bg("public/himatif.jpg", "public/logo.png")
