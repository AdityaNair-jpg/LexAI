package main

import (
  "flag"
  "log"
  "os"
  "path/filepath"
  "sort"
  "strings"

  "github.com/gdamore/tcell/v2"
  "github.com/rivo/tview"
)

func listEntries(dir string) ([]string, error) {
  f, err := os.ReadDir(dir)
  if err != nil {
    return nil, err
  }
  names := []string{".."}
  for _, de := range f {
    name := de.Name()
    if de.IsDir() {
      name = name + "/"
    }
    names = append(names, name)
  }
  sort.Strings(names)
  return names, nil
}

func main() {
  dir := flag.String("dir", ".", "start directory")
  flag.Parse()

  current := *dir
  if current == "" {
    var err error
    current, err = os.Getwd()
    if err != nil {
      log.Fatal(err)
    }
  }

  app := tview.NewApplication()
  header := tview.NewTextView().SetTextAlign(tview.AlignLeft)
  header.SetText("Opencode Go TUI - Directory: " + current)

  list := tview.NewList().ShowSecondaryText(false)
  list.SetBorder(true).SetTitle("Entries")

  refresh := func() {
    entries, err := listEntries(current)
    if err != nil {
      header.SetText("Error: " + err.Error())
      return
    }
    list.Clear()
    for _, name := range entries {
      n := name
      isDir := strings.HasSuffix(name, "/")
      display := n
      if isDir {
        display = n
      }
      path := filepath.Join(current, strings.TrimSuffix(display, "/"))
      // capture for closure
      list.AddItem(display, "", 0, func() {
        info, err := os.Stat(path)
        if err != nil {
          header.SetText("Error: " + err.Error())
          return
        }
        if info.IsDir() {
          current = path
          header.SetText("Opencode Go TUI - Directory: " + current)
          refresh()
        } else {
          modal := tview.NewModal()
          modal.SetText("Open file: " + path + "?")
          modal.AddButtons([]string{"Open", "Cancel"})
          modal.SetDoneFunc(func(buttonIndex int, buttonLabel string) {
            if buttonLabel == "Open" {
              header.SetText("Opened: " + path)
            }
            app.SetRoot(rootFlex(app, header, list), true)
            app.SetFocus(list)
          })
          app.SetRoot(modal, false)
        }
      })
    }
  }

  root := rootFlex(app, header, list)

  refresh()
  if err := app.SetRoot(root, true).SetFocus(list).Run(); err != nil {
    log.Fatal(err)
  }
}

func rootFlex(app *tview.Application, header *tview.TextView, list *tview.List) *tview.Flex {
  footer := tview.NewTextView().SetText("Navigate: ↑/↓  Enter: open dir, q to quit").SetTextAlign(tview.AlignLeft)
  return tview.NewFlex().SetDirection(tview.FlexRow).
    AddItem(header, 1, 0, false).
    AddItem(list, 0, 1, true).
    AddItem(footer, 1, 0, false)
}
