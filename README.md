Simple to use jekyll-markdown parsing note-taking app for the command line and your favorite editor and unix tools.

**Package is still in development and testing. There may be breaking changes.**


Features
===============================================================================

- Create, edit, manage and search text-based notes using markdown
- Read from single flexible storage directory, search, filter and list notes
- List tags
- Use your standard vavorite $EDITOR to edit notes

- compatible with "notes" created with [notable](https://notable.md) or [notes-cli](https://github.com/rhysd/notes-cli)

Other ideas & planned features can be found in the [wiki](./wiki). If something doesn’t work please [create a new issue](https://github.com/Ephigenia/notable-cli/issues).


Installation
===============================================================================

    npm install -g notable-cli

Or use it directly using `npx`:

    npx notable-cli

Please note that all examples in this README.md assume that you have installed notable-cli globally. If not, just replace the `notable-cli` call with `npx notable-cli` and you’re fine.


Configuration
===============================================================================

The cli searches for not-hidden markdown files ending with `.md` in the notebooks home directory which must be set in environment variable: `NOTABLE_CLI_HOME`.

You can set this by exporting it or setting it in your `.bash_profile`:

    export NOTABLE_CLI_HOME=~/Notes

If `NOTABLE_CLI_HOME` isn’t defined, it checks for `NOTES_CLI_HOME` or `NOTES_CLI_HOME`.


Usage
===============================================================================

List Notes
-------------------------------------------------------------------------------
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

Text-Based User Interface ([TUI](https://en.wikipedia.org/wiki/Text-based_user_interface))
-------------------------------------------------------------------------------
The interactive text-mode interface a [neo-blessed](https://github.com/embark-framework/neo-blessed) powered interactive cli inerface that allows you to list all the notes, tags and creation/modified date while entering a search query on top and preview the notes as soon as there’s one selected in the list:

    notable-cli --interactive

It can also get combined with other arguments like searching or filtering by tags:
    
    notable-cli --tags Project/IKEA --interactive

### Panes

There are 3 panes, search input, list of notes and a note-preview which shows the currently selected note:

    ┌─Search──────────────────────────────────────────────────────────────────────────────────────────┐
    │ Notable                                                                                         │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘
    ┌──Notes (1)────────┬──────────────────────────────────┬──────────────────────────────────────────┐
    │ Title             │ Tags                             │ Created ⬆ / Age                          │
    │ Notable-Cli Ideas │ Ideas, Note, Project/Notable-CLI │ 2019-11-04 07:56  / 6                    │
    │                   │                                  │                                          │
    │                   │                                  │                                          │
    │                   │                                  │                                          │
    │                   │                                  │                                          │
    │                   │                                  │                                          │
    │                   │                                  │                                          │
    │                   │                                  │                                          │
    │                   │                                  │                                          │
    └───────────────────┴──────────────────────────────────┴──────────────────────────────────────────┘
    ┌──/Users/ephigenia/Google Drive File Stream/Meine Ablage/Notable/notes/Notable-Cli Ideas.md──────┐
    │                                                                                                 │
    │ # Notable-Cli Ideas                                                                             │
    │                                                                                                 │
    │ ### Roadmap                                                                                     │
    │                                                                                                 │
    │ ## Questions / Problems                                                                         │
    │                                                                                                 │
    │     * when and how to update modified date                                                      │
    │                                                                                                 │
    │ ## Later Versions                                                                               │
    │                                                                                                 │
    │     * tag batch editing / removing / adding / renaming                                          │
    │                                                                                                 │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘

### Key-Bindings

- `<tab>` or `<shift>-<tab>` - focus on next or previous pane
- `r` - reload data from directory
- `f` - focus on text input search for fast searching notes
- `o` - open the currently selected note in the editor
- `q`, `<esc>`, `<ctrl>-c` - quit the application
- `s` or `S` - switch to next or previous sorting direction

## Full output

When using `--full` is used all query matching notes will be shown with their full content.

    notable-cli list --full

Use `less` for paging through the output:

    notable-cli list Standup --full | less


Tags
-------------------------------------------------------------------------------
List all tags

    notable-cli tags


New Notes
-------------------------------------------------------------------------------
Creating new notes accepts the title of the note as first argument and tags as CSV list as the second argument. It will create a file using the title which renderes a template that contain a list of template variables.

    notable-cli new YYYYMMDD-Standup Project/MyProject,Standup,Note

This will create and emmidiently open new note with the current date + "-Standup" as title using the Tags "Project/MyProject", "Standup" and "Note".

## New Notes in Sub-Directories

When the title of the note contains slashes it will be saved in a sub-directory of the home directory.

    notable-cli new Project/Open-Source/YYYYMMDD-Note 

Will create a new file in the "Project/Open-Source/" directory. If that directory doesn’t exist it will get created. Also each directory is added as tag of the newly created file so you don’t have to add them as tags.

## Templates

You can pipe in a file’s content or the template string directly to `notable-cli new` to get it used as template. The content will be handled as [handlebars](https://handlebarsjs.com/) template.

Using a template:

    cat templates/daily.template.md | notable-cli new YYYYMMDD-Note

Using a template string

    echo "my new note created by {{username}}" | notable-cli new YYYYMMDD-Note

## Template variables

| name           | value                                         |
|----------------|-----------------------------------------------|
| `{{created}}`  | ISO string when the file was created          |
| `{{modified}}` | ISO string when the file was modified         |
| `{{tags}}`     | csv list of tags                              |
| `{{title}}`    | title of the file                             |
| `{{username}}` | current username                              |

There’s also a "format" helper which can be used to add formatted english dates. F.e. if you use `{{ format created 'YYYY-MM-DD' }}` then it will add this date string at the position in the template.


Other Projects
===============================================================================
List of other, alternate or compatible, inspiring projects that use similar markdown syntax or features.

- [joplin-cli](https://joplinapp.org/terminal/)
- [notable](https://notable.md)
- [notes-cli](https://github.com/rhysd/notes-cli)
- [orgmode](https://orgmode.org)
- [tnote](https://github.com/tasdikrahman/tnote)
