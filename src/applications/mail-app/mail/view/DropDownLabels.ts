import m, { Children, ClassComponent, Vnode, VnodeDOM } from "mithril"
import { AllIcons, Icon, IconSize } from "../../../../ui/base/Icon.js"
import { Icons } from "../../../../ui/base/icons/Icons.js"
import { LabelState } from "../model/MailModel.js"
import { lang, MaybeTranslation } from "../../../../ui/utils/LanguageViewModel.js"
import { AssignedLabels } from "../../settings/AddInboxRuleDialog"
import { TextField, TextFieldAttrs } from "../../../../ui/base/TextField"
import { IconButton } from "../../../../ui/base/IconButton"
import { ButtonSize } from "../../../../ui/base/ButtonSize"
import { Keys, TabIndex } from "@tutao/app-env"
import { AriaRole } from "../../../../ui/AriaUtils"
import { theme } from "../../../../ui/theme"
import { getElementId } from "@tutao/meta"
import { getLabelColor } from "../../../../ui/base/Label"
import { BaseButton, BaseButtonAttrs } from "../../../../ui/base/buttons/BaseButton"
import { modal, ModalComponent } from "../../../../ui/base/Modal"
import { PosRect } from "../../../../ui/utils/PosRect"
import { MailSet } from "@tutao/entities/tutanota"
import { focusNext, focusPrevious, Shortcut } from "../../../../ui/utils/KeyManager"
import { getDetachedDropdownBounds } from "../../../../ui/base/GuiUtils"
import { styles } from "../../../../ui/styles"
import { component_size, size } from "../../../../ui/size"
import { showDropdown } from "../../../../ui/base/Dropdown"

/**
 * DropDown that displays labels and allows selecting them
 */

export interface DropDrownLabelsAttrs {
	label: MaybeTranslation
	items: AssignedLabels[]
	icon: TextFieldAttrs["leadingIcon"]
}
export class DropDownLabels implements ClassComponent<DropDrownLabelsAttrs> {
	view(vnode: Vnode<DropDrownLabelsAttrs>): Children {
		const attrs = vnode.attrs
		const showLabels = new ShowLabels(
			document.activeElement as HTMLElement,
			getDetachedDropdownBounds(),
			styles.isDesktopLayout() ? 300 : 200,
			attrs.items,
			async (addedLabels, removedLabels) => {},
		)

		return m(TextField, {
			value: attrs.label.toString(),
			isReadOnly: true,
			onclick: () => {
				showLabels.show()
			},
			class: "click ",
			leadingIcon: attrs.icon,
			injectionsRight: () =>
				m(
					".flex.items-center.justify-center",
					{ style: { width: "30px", height: "30px" } },
					m(IconButton, {
						icon: Icons.ArrowDown,
						label: "show_action",
						click: () => {
							showLabels.show()
						},
						size: ButtonSize.Compact,
					}),
				),
			doShowBorder: true,
		})
	}
}

export class ShowLabels implements ModalComponent {
	private dom: HTMLElement | null = null

	constructor(
		private readonly sourceElement: HTMLElement,
		private readonly origin: PosRect,
		private readonly width: number,
		private readonly items: AssignedLabels[],
		private readonly onLabelsApplied: (addedLabels: MailSet[], removedLabels: MailSet[]) => unknown,
	) {
		this.view = this.view.bind(this)
		this.oncreate = this.oncreate.bind(this)
	}

	async hideAnimation(): Promise<void> {}

	onClose(): void {
		modal.remove(this)
	}

	shortcuts(): Shortcut[] {
		return this.shortCuts
	}

	backgroundClick(e: MouseEvent): void {
		modal.remove(this)
	}

	popState(e: Event): boolean {
		return true
	}

	callingElement(): HTMLElement | null {
		return this.sourceElement
	}

	view(): void | Children {
		return m(
			".flex.col.elevated-bg.abs.dropdown-shadow.pt-8.border-radius",
			{
				tabindex: TabIndex.Programmatic,
				role: AriaRole.Menu,
				"data-testid": "dropdown:labels",
			},
			[
				m(
					".pb-8.scroll",
					this.items.map((labelState) => {
						const { label, state, displayName } = labelState
						const color = theme.on_surface
						const canToggleLabel = state === LabelState.Applied || state === LabelState.AppliedToSome
						const opacity = !canToggleLabel ? 0.5 : undefined

						return m(
							"label-item.flex.items-center.plr-12.state-bg.cursor-pointer",

							{
								"data-labelid": getElementId(label),
								role: AriaRole.MenuItemCheckbox,
								tabindex: TabIndex.Default,
								"aria-checked": ariaCheckedForState(state),
								"aria-disabled": !canToggleLabel,
								onclick: () => {
									labelState.state = state === LabelState.Applied ? LabelState.NotApplied : LabelState.Applied
								},
							},
							[
								m(Icon, {
									icon: this.iconForState(state),
									size: IconSize.PX24,
									style: {
										fill: getLabelColor(label.color),
										opacity,
									},
								}),
								m(
									".button-height.flex.items-center.ml-12.overflow-hidden",
									{
										style: {
											color,
											opacity,
										},
									},
									m(".text-ellipsis", displayName),
								),
							],
						)
					}),
				),
				// this.viewModel.isLabelLimitReached() ? m(".small.center.pb-8", lang.get("maximumLabelsPerMailReached_msg")) : null,
				m(BaseButton, {
					label: "apply_action",
					text: lang.get("apply_action"),
					class: "limit-width noselect bg-transparent button-height text-ellipsis content-accent-fg flex items-center plr-8 button-content justify-center border-top state-bg",
					onclick: () => {
						this.applyLabels()
					},
				} satisfies BaseButtonAttrs),
				m(BaseButton, {
					label: "close_alt",
					text: lang.get("close_alt"),
					class: "hidden-until-focus content-accent-fg button-content",
					onclick: () => {
						modal.remove(this)
					},
				}),
			],
		)
	}

	private iconForState(state: LabelState): AllIcons {
		switch (state) {
			case LabelState.AppliedToSome:
				return Icons.LabelPartialOutline
			case LabelState.Applied:
				return Icons.LabelFilled
			case LabelState.NotApplied:
				return Icons.LabelOutline
		}
	}

	private applyLabels() {
		modal.remove(this)
	}

	oncreate(vnode: VnodeDOM) {
		this.dom = vnode.dom as HTMLElement

		// restrict label height to showing maximum 6 labels to avoid overflow
		const displayedLabels = Math.min(this.items.length, 6)
		const height = (displayedLabels + 1) * component_size.button_height + size.spacing_8 * 2
		showDropdown(this.origin, this.dom, height, this.width).then(() => {
			const firstLabel = vnode.dom.getElementsByTagName("label-item").item(0)
			if (firstLabel !== null) {
				;(firstLabel as HTMLElement).focus()
			} else {
				;(vnode.dom as HTMLElement).focus()
			}
		})
	}

	private readonly shortCuts: Array<Shortcut> = [
		{
			key: Keys.ESC,
			exec: () => this.onClose(),
			help: "close_alt",
		},
		{
			key: Keys.TAB,
			shift: true,
			exec: () => (this.dom ? focusPrevious(this.dom) : false),
			help: "selectPrevious_action",
		},
		{
			key: Keys.TAB,
			shift: false,
			exec: () => (this.dom ? focusNext(this.dom) : false),
			help: "selectNext_action",
		},
		{
			key: Keys.UP,
			exec: () => (this.dom ? focusPrevious(this.dom) : false),
			help: "selectPrevious_action",
		},
		{
			key: Keys.DOWN,
			exec: () => (this.dom ? focusNext(this.dom) : false),
			help: "selectNext_action",
		},
		{
			key: Keys.RETURN,
			exec: () => this.applyLabels(),
			help: "ok_action",
		},
		{
			key: Keys.SPACE,
			exec: () => {},
			help: "ok_action",
		},
	]

	show() {
		modal.displayUnique(this, false)
	}
}
function ariaCheckedForState(state: LabelState): string {
	switch (state) {
		case LabelState.Applied:
			return "true"
		case LabelState.AppliedToSome:
			return "mixed"
		case LabelState.NotApplied:
			return "false"
	}
}
