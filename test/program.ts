/// <reference path="other.ts" />
class MyClass {
    private view:Action<string>;
    get View():Action<string> { return this.view; }
    set View(value:Action<string>) { this.view = value }
}