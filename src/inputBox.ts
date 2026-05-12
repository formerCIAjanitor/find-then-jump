import {
	type Disposable,
	type TextEditor,
	window,
	type InputBox as PlatformInputBox,
} from "vscode";

const subscriptions: Disposable[] = [];

class InputBox {
	inputBox: PlatformInputBox;
	previousInputValue = "";
	jumpBuffer = "";

	constructor(
		private props: {
			textEditor: TextEditor;
			onInputValueChange(input: string, label: string): void;
			onCancel(): void;
		},
	) {
		this.inputBox = this.instantiateAndShowInputBox();
	}

	private instantiateAndShowInputBox = () => {
		const inputBox = window.createInputBox();
		inputBox.placeholder = "Jump to...";
		inputBox.onDidChangeValue(this.handleInputValueChange);
		inputBox.onDidAccept(this.handleCancel);
		inputBox.onDidHide(this.handleCancel);
		inputBox.show();
		return inputBox;
	};

	public destroy = () => {
		this.inputBox.dispose();
		subscriptions.forEach((subscription) => subscription.dispose());
	};

	private handleInputValueChange = (newInputValue: string) => {
		if (!this.wasBackspacePressed(newInputValue)) {
			// Backspace pressed — reset buffer and notify with no label
			this.jumpBuffer = "";
			this.previousInputValue = newInputValue;
			this.props.onInputValueChange(this.inputBox.value, "");
			return;
		}

		const newChars = newInputValue.slice(this.previousInputValue.length);
		this.jumpBuffer += newChars;
		this.previousInputValue = newInputValue;

		if (this.jumpBuffer.length >= 2) {
			const label = this.jumpBuffer.slice(0, 2);
			this.jumpBuffer = "";
			this.props.onInputValueChange(this.inputBox.value, label);
		} else {
			// One char buffered, waiting for second — update search display only
			this.props.onInputValueChange(this.inputBox.value, "");
		}
	};

	private wasBackspacePressed = (newInputValue: string) => {
		return this.previousInputValue.length < newInputValue.length;
	};

	private getCharPressed(value: string) {
		return value.charAt(value.length - 1);
	}

	private handleCancel = () => {
		this.destroy();
		this.props.onCancel();
	};
}

export { subscriptions, InputBox };
