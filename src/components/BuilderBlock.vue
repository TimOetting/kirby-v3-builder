<template>
  <div :class="['kBuilderBlock', 'kBuilderBlock--col-' + columnsCount, {'kBuilderBlock--pending': pending }, 'kBuilderBlock--'+ status]">
    <div :class="'kBuilderBlock__header kBuilderBlock__header--col-' + columnsCount" >
      <k-icon 
        type="sort" 
        :class="'kBuilder__dragDropHandle kBuilder__dragDropHandle--col-' + columnsCount" 
      />
      <span 
        class="kBuilderBlock__label"
        @click="toggleExpand"
      >
        <k-icon
          class="kBuilderBlock__expandedIcon" 
          :class="{'kBuilderBlock__expandedIcon--expanded': expanded}" 
          type="angle-down"
        />
        {{block.label}}
      </span>
      <div class="kBuilderBlock__actions">
        <k-button-group class="kBuilderBlock__actionsGroup">
          <k-button 
            v-if="fieldSets.length > 1 || block.preview"
            v-for="fieldSet in fieldSets"
            :key="'showFierldSetButton-' + _uid + fieldSet.key"
            :icon="tabIcon(fieldSet.icon)" 
            :image="tabImage(fieldSet.icon)"
            @click="displayFieldSet(fieldSet.key); toggleExpand(true)"
            class="kBuilderBlock__actionsButton"
            :class="{'kBuilderBlock__actionsButton--active': isEdit}"
          >{{fieldSet.label}}</k-button>
          <k-button 
            v-if="block.preview"
            icon="preview" 
            @click="displayPreview()"
            class="kBuilderBlock__actionsButton" 
            :class="{'kBuilderBlock__actionsButton--active': isPreview}"
          ></k-button>
        </k-button-group>
        <div class="kBuilderBlock__control">
          <k-dropdown class="kBuilderBlock__actionsDropDown">
            <k-button 
              icon="dots" 
              @click="$refs['blockActions' + block.uniqueKey].toggle()"
              class="kBuilderBlock__actionsButton"
            ></k-button>
            <k-dropdown-content :ref="'blockActions' + block.uniqueKey">
              <k-dropdown-item 
                icon="copy" 
                @click="$emit('clone', index)"
              >{{ $t('builder.clone') }}</k-dropdown-item>
              <k-dropdown-item 
                icon="trash" 
                @click="$emit('delete', index)"
              >{{ $t('delete') }}</k-dropdown-item>
            </k-dropdown-content>
          </k-dropdown>
        </div>
      </div>
    </div>
    <div 
      class="kBuilderBlock__content"
      v-show="expanded"
    >
      <div v-if="isPreview" class="kBuilder__previewFrame" v-html="previewContent"></div>

      <k-fieldset 
        v-if="isEdit" 
        v-for="fieldSet in fieldSets"
        class="kBuilderBlock__form"
        v-model="fieldSet.model" 
        :value="{}" 
        :fields="fieldSet.fields" 
        :validate="true"
        v-on="$listeners"
        :key="fieldSet.key + _uid" 
      />
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'block',
    'index',
    'columnsCount',
    'pageUid',
    'pageId',
  ],
  mounted() {
    if (this.block.isNew) {
      this.$nextTick(function () {
        this.pending = false
      });
    } else {
      this.pending = false
    }
    if (!this.block.content._uid) {
      this.block.content._uid = this.block.content._key + '_' + new Date().valueOf() + '_' + this._uid
    }
    if (!this.activeFieldSet) {
      this.activeFieldSet = this.fieldSets[0].key
    }
    let localUiState = JSON.parse(localStorage.getItem(this.localUiStateKey))
    if (localUiState) {
      this.expanded = localUiState.expanded
      this.showPreview = localUiState.showPreview
      this.activeFieldSet = localUiState.activeFieldSet
    } else {
      this.storeLocalUiState()
    }
    if (this.block.preview && this.showPreview) {
      this.displayPreview(this.block.preview)
    } else {
      this.displayFieldSet(this.activeFieldSet)
    }
    if (this.block.isNew) {
      this.$emit('input')
    }
  },
  data() {
    return {
      pending: true,
      activeFieldSet: null,
      expanded: true,
      previewFrameContent: null,
      previewHeight: 0,
      showPreview: false,
      previewContent: ''
    }
  },
  computed: {
    localUiStateKey() {
      return `kBuilder.uiState.${this.block.content._uid}`
    },
    extendedUid() {
      return this.pageId.replace('/', '-') + '-' + this._uid
    },
    fieldSets() {
      let fieldSets = []
      if (this.block.tabs) {
        for (const tabKey in this.block.tabs) {
          if (this.block.tabs.hasOwnProperty(tabKey)) {
            const tab = this.block.tabs[tabKey];
            fieldSets.push(this.newFieldSet(tab, tabKey, this.block.content))
          }
        }
      } else if (this.block.fields) {
        fieldSets.push(this.newFieldSet(this.block, 'content', this.block.content, 'edit', this.$t('edit')))
      }
      return fieldSets
    },
    status() {
      if(this.expanded) {
        if(this.showPreview) {
          return 'preview'
        }
        else {
          return 'edit'
        }
      }
      else {
        return 'closed'
      }
    },
    isPreview() {
      return this.status == 'preview'
    },
    isEdit() {
      return this.status == 'edit'
    },
    isClosed() {
      return this.status == 'closed'
    }
  },
  methods: {
    onBlockInput(event) {
      this.$emit("input", this.val)
    },
    displayPreview() {
      this.showPreview = true
      this.expanded = true
      
      let previewData = {
        preview: this.block.preview,
        pageid: this.pageId,
        blockContent: this.block.content,
        blockUid: this.extendedUid
      }

      this.$api.post('kirby-builder/get-preview', previewData)
          .then(response => {
            this.previewContent = response.preview
          })

      this.storeLocalUiState()
    },
    displayFieldSet(fieldSetKey) {
      this.showPreview = false
      this.activeFieldSet = fieldSetKey
      this.previewHeight = 0
      this.storeLocalUiState()
    },
    onPreviewLoaded(event) {
      this.previewHeight = event.detail.height
      this.activeFieldSet = null
    },
    toggleExpand(expanded) {
      if (typeof expanded === 'boolean') {
        this.expanded = expanded
      } else {
        this.expanded = (this.expanded) ? false : true
      }
      this.storeLocalUiState()
    },
    newFieldSet(fieldSet, key, model, icon, label) {
      let newFieldSet = {
        fields: fieldSet.fields,
        key: key,
        model: model,
        icon: icon || fieldSet.icon || null,
        label: label || fieldSet.label || null,
      }
      return newFieldSet
    },
    storeLocalUiState() {
      let localUiState = {
        expanded: this.expanded,
        showPreview: this.showPreview,
        activeFieldSet: this.activeFieldSet,
      }
      localStorage.setItem(this.localUiStateKey, JSON.stringify(localUiState))
    },
    tabIcon(icon) {
      if (!icon) {
        return null
      }
      const isPath = (icon.indexOf('/') > -1 && icon.indexOf('.') > -1)
      return isPath ? null : icon
    },
    tabImage(icon) {
      if (!icon) {
        return null
      }
      const isPath = (icon.indexOf('/') > -1 && icon.indexOf('.') > -1)
      return isPath ? icon : null
    }
  }
}
</script>

<style lang="stylus">
  .kBuilderBlock
    background: white;
    box-shadow: 0 2px 5px rgba(22,23,26,.05);
    position: relative;
    opacity: 1;
    transition: opacity .5s, transform .5s;
    &--pending
      opacity: 0;
      transform: translateY(5%);

    &.kBuilderBlock--closed
      .kBuilderBlock__header
        background: white;
    &.kBuilderBlock--preview
      .kBuilderBlock__header
        background: white;
        border-bottom: 1px dashed #ccc;
    &.kBuilderBlock--edit
      box-shadow: 0 0 0 3px rgba(22,23,26,.05);
      border: 1px solid #ccc;
      .kBuilderBlock__header
        border-bottom: 1px dashed #ccc;

    &__label
      display flex
      cursor pointer
      height 100%
      align-items center
    &__expandedIcon
      margin-right 4px
      transform rotate(-90deg)
      &--expanded
        transform rotate(0)
    &__header
      height: 38px;    
      font-size: .875rem;
      // color: #999;
      display: flex;
      align-items: center;
      background: #efefef;
      &--col-1
        padding-left: .75rem;
    &__actions
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
    &__actionsGroup
      margin-right 0
      &.k-button-group>.k-button
        padding-top 0
        padding-bottom 0
    &__actionsDropDown
      display inline-block
    &__actionsButton
      min-width 38px
      height 38px
      opacity .5
      color rgb(22, 23, 26)
      &:hover
        opacity .7
      &--active
        pointer-events: none;
        opacity 1
      .k-button-figure img
        background-color transparent
        border-radius 0
    &__form
      padding: 2rem 2.5rem 2.5rem;
      background: #efefef;
    .sortable-drag
      cursor: -webkit-grab;
    .k-structure
      margin-left: 25px;
  .sortable-ghost > .k-column-content > .kBuilderBlock
  .sortable-ghost > .kBuilderBlock
    box-shadow 0 0 0 2px #4271ae, 0 5px 10px 2px rgba(22,23,26,.25)
</style>

