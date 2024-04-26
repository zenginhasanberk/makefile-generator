// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "makefile-generator" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "makefile-generator.createMakefile",
    async () => {
      if (vscode.workspace.workspaceFolders !== undefined) {
        const workspace_path: string =
          vscode.workspace.workspaceFolders[0].uri.path;
        const makefile_path: string = workspace_path + "/Makefile";
        const edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();

        if (fs.existsSync(makefile_path)) {
          vscode.window.showInformationMessage(
            "Another Makefile in your project already exists. Please remove that to use the extension."
          );
          return;
        }

        edit.createFile(vscode.Uri.file(makefile_path));

        let cpp_version = await vscode.window.showInputBox({
            placeHolder:
              "Enter c++ version. Ex:17. Default value is 17.",
          });

        if (cpp_version === "" || cpp_version === null ) {
            cpp_version = "17";
        }
  
        let src_dir = await vscode.window.showInputBox({
          placeHolder:
            "Enter source directory relative to your workspace folder. Default value is current workspace directory.",
        });

        if (src_dir === "" || src_dir === null ) {
          src_dir = ".";
        }

        let build_dir = await vscode.window.showInputBox({
          placeHolder:
            "Enter build directory relative to your workspace folder. Default value is current workspace directory.",
        });

        if (build_dir === "" || build_dir === null) {
          build_dir = ".";
        }

        let target_name = await vscode.window.showInputBox({
          placeHolder:
            'Enter target name. Default value is "executable".',
        });

        if (target_name === "" || target_name === null) {
          target_name = "executable";
        }

        const linker_libraries = await vscode.window.showInputBox({
            placeHolder:
              'Enter linker libraries if you are using any. Default value is nothing.',
          });

        const linker_flags = await vscode.window.showInputBox({
            placeHolder:
              'Enter linker flags if you have any. Default value is nothing.',
          });

        let content: string = 
`# Compiler
CXX := g++ 

# Compile options
CXXFLAGS := -std=c++${cpp_version} -Wall

# Build directory
BUILD_DIR := ${build_dir}

# Source directory
SRC_DIR := ${src_dir}

# Linker flags
LDFLAGS := ${linker_flags}

# Linker Libraries
LDLIBS := ${linker_libraries}

# Target executable name
TARGET := $(BUILD_DIR)/${target_name}

# Find all cpp files in the source directory
SOURCES := $(wildcard $(SRC_DIR)/*.cpp)

# Object files have the same names as cpp files, but with .o extension
OBJECTS := $(SOURCES:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)

# Default target
all: $(TARGET)

# Link the target with all object files
$(TARGET): $(OBJECTS)
\t$(CXX) $(CXXFLAGS) $(LDFLAGS) -o $(TARGET) $(OBJECTS) $(LDLIBS)

# Compile each source file to an object file
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp
\t$(CXX) $(CXXFLAGS) -c $< -o $@

# Clean up target
.PHONY: clean
clean:
\trm -f $(TARGET) $(OBJECTS)`;

        const byteArray: Uint8Array = new TextEncoder().encode(content);

        vscode.workspace.fs.writeFile(
          vscode.Uri.file(makefile_path),
          byteArray
        );
      } else {
        vscode.window.showInformationMessage(
          "Please run the extension in your workspace!"
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
