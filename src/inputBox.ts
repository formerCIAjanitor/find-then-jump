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

	constructor(
		private props: {
			textEditor: TextEditor;
			onInputValueChange(input: string, char: string): void;
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
		const charPressed = this.wasBackspacePressed(newInputValue)
			? this.getCharPressed(newInputValue)
			: "";

		this.previousInputValue = newInputValue;
		this.props.onInputValueChange(this.inputBox.value, charPressed);
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
