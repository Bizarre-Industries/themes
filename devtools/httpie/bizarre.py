from pygments.style import Style
from pygments.token import Comment, Error, Generic, Keyword, Literal, Name, Number, Operator, Punctuation, String, Text


class BizarreStyle(Style):
    background_color = "#0E0E0E"
    highlight_color = "#2B3A0E"
    default_style = "#E4E4E4"
    styles = {
        Text: "#E4E4E4",
        Error: "bold #FF6F77",
        Comment: "italic #6F6F6F",
        Keyword: "#FF8FCF",
        Keyword.Declaration: "#D88AE0",
        Operator: "#9DEAEA",
        Punctuation: "#7A7A7A",
        Name: "#E4E4E4",
        Name.Function: "#C6FF24",
        Name.Class: "#7AD9D9",
        Name.Decorator: "italic #FF8FCF",
        Name.Builtin: "#E8A33D",
        Literal: "#E8A33D",
        String: "#E8A33D",
        Number: "#7BB3FF",
        Generic.Heading: "bold #C6FF24",
        Generic.Inserted: "#5BD06B",
        Generic.Deleted: "#FF6F77",
        Generic.Emph: "italic",
        Generic.Strong: "bold",
    }
