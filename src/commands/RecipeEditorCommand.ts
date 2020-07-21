import { EditorCommand } from './EditorCommand';

export class RecipeEditorCommand extends EditorCommand {

    id = "RecipeEditor";
    title = "Recipe Editor";
    folder = "recipes";
    jsonKeys = ["type", "pattern", "ingredients", "ingredient", "key", "result", "experience", "cookingtime", "item", "count", "group"];

    onReceiveMessage(message: any): boolean {
        return true;
    }

    getKeys(message: any): string[] {
        let keys = this.jsonKeys;
        if (message.json.key) {
            keys = this.jsonKeys.concat(Object.keys(message.json.key));
        }
        return keys;
    }
}