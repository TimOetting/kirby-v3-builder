# Kirby Builder Beta for Kirby v3

To quickly get an example including the previews of the builder working, copy the files inside the `sandbox` folder into the respective folders and add the following field declaration to a blueprint:

```
mybuilder:
  label: Page Builder
  type: builder
  columns: 1
  fields:
    bodytext:
      label: Text Block (without preview but with tabs)
      type: builderSet
      fields:
        text:
          label: text
          type: textarea
        fontfamily:
          label: Font
          type: select
          options:
            helvetica: Helvetica
            comicsans: Comic Sans
        fontsize:
          label: Font Size
          type: number
    quote:
      label: Quote
      type: builderSet
      preview:
        snippet: blocks/quote
        css: /assets/css/blocks/quote.css
      fields:
        text:
          label: Quote Text
          type: textarea
        citation:
          label: Citation
          type: text
    events:
      label: Events
      type: builderSet
      preview:
        snippet: blocks/events
        css: /assets/css/blocks/events.css
      fields:
        eventlist:
          type: builder
          label: Event List
          columns: 2
          fields:
            event:
              label: Event
              fields:
                title:
                  label: Title
                  type: text
                text:
                  label: Description
                  type: textarea
                date:
                  label: Date
                  type: date

```