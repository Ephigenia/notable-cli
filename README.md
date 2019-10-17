Simple to use jekyll-markdown parsing note-taking app for the command line and your favorite editor and unix tools.

Package is still in development and testing. There may be breaking changes.

Features

===============================================================================

- Create new notes using templates 
- Read from storage and search, filter and list notes
- List tags
- configurable storage directory

- compatible with "notes" created with [notable](https://notable.md)


Configuration
===============================================================================

The cli searches for not-hidden markdown files ending with `.md` in the notebooks directory which must be set in environment variable: `NOTABLE_CLI_HOME`.

You can set this by exporting it or setting it in your `.bash_profile`:

    export NOTABLE_CLI_HOME=~/Notes


Examples
===============================================================================

## List Notes

Listing all notes in column output with creation data, title and tags:

    notable-cli list --oneline

## Search Notes

You can search in *tags*, *title* and *content* of all notes with a regular expression syntax when using the first argument "query". Just imagine you’re searching your notes which contain "Meeting":

    notable-cli list Meeting

You can also be more specific when you know that you’re searching for a specific tag:

    notable-cli list --tag Meeting

Searching by a specific date just needs to enter the date in `YYYYMMDD` format:

    notable-cli list 20191011

## Sorting Notes

The list can be sorted using the `--sort` parameter. So you can open your last created note:

    notable-cli list --sort created | tail -n 1 | xargs $EDITOR

## Open Notes

Notes can be opened piping the output of `notable-cli list` to your favorite editor or by using the `--editor` option which opens the editor.

    notable-cli list | xargs $EDITOR

Same thing can be archived by:

    notable-cli list --editor

## Interactive Mode

The interactive mode allows you to list all the notes, tags and creation date while entering a search query on top and preview the notes as soon as there’s one selected in the list:

    notable-cli --interactive

TODOC: describe usage & keys

## Full output

When using `--full` is used all query matching notes will be shown with their full content.

    notable-cli list --full

Use `less` for paging through the output:

    notable-cli list Standup --full | less

## Tag

List all tags

    notable-cli tags

## New Notes

Creating new notes accepts the title of the note as first argument and tags as CSV list as the second argument. It will create a file using the title which renderes a template that contain a list of template variables.

    notable-cli new YYYYMMDD-Standup Project/MyProject,Standup,Note

This will create and emmidiently open new note with the current date + "-Standup" as title using the Tags "Project/MyProject", "Standup" and "Note".

## Templates

TBD there will be templates that can be used

## Template variables

| name     | value |
| -------- | ----- |
| `{{created}}`  | ISO string when the file was created |
| `{{modified}}` | ISO string when the file was modified |
| `{{tags}}`     | csv list of tags |
| `{{title}}`    | title of the file |
| `{{username}}` | current username |


Other Projects
===============================================================================
List of other projects that use similar markdown syntax or features.

- https://notable.md
- https://github.com/rhysd/notes-cli
