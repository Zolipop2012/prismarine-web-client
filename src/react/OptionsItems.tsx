import { useSnapshot } from 'valtio'
import { noCase } from 'change-case'
import { titleCase } from 'title-case'
import { useMemo } from 'react'
import { options, qsOptions } from '../optionsStorage'
import { miscUiState } from '../globalState'
import Button from './Button'
import Slider from './Slider'
import Screen from './Screen'
import { showOptionsModal } from './SelectOption'

type GeneralItem<T extends string | number | boolean> = {
  id?: string
  text?: string,
  disabledReason?: string,
  disabledDuringGame?: boolean
  tooltip?: string
  // description?: string
  enableWarning?: string
  willHaveNoEffect?: boolean
  values?: Array<T | [T, string]>
}

export type OptionMeta<T = any> = GeneralItem<T & string> & ({
  type: 'toggle',
} | {
  type: 'slider'
  min?: number,
  max?: number,
  valueText?: (value: number) => string,
  unit?: string,
  delayApply?: boolean,
} | {
  type: 'element'
  render: () => React.ReactNode,
})

// todo not reactive
const isDisabled = (item: GeneralItem<any>) => {
  return Object.keys(qsOptions).includes(item.id!)
}

export const OptionButton = ({ item }: { item: Extract<OptionMeta, { type: 'toggle' }> }) => {
  const optionValue = useSnapshot(options)[item.id!]

  const valuesTitlesMap = useMemo(() => {
    if (!item.values) {
      return {
        true: 'ON',
        false: 'OFF',
      }
    }
    return Object.fromEntries(item.values.map((value) => {
      if (typeof value === 'string') {
        return [value, titleCase(noCase(value))]
      } else {
        return [value[0], value[1]]
      }
    }))
  }, [item.values])

  return <Button
    label={`${item.text}: ${valuesTitlesMap[optionValue]}`}
    onClick={async () => {
      if (item.disabledReason) {
        await showOptionsModal(`The option is unavailable. ${item.disabledReason}`, [])
        return
      }
      if (item.enableWarning && !options[item.id!]) {
        const result = await showOptionsModal(item.enableWarning, ['Enable'])
        if (!result) return
      }
      const { values } = item
      if (values) {
        const getOptionValue = (arrItem) => {
          if (typeof arrItem === 'string') {
            return arrItem
          } else {
            return arrItem[0]
          }
        }
        const currentIndex = values.findIndex((value) => {
          return getOptionValue(value) === optionValue
        })
        if (currentIndex === -1) {
          options[item.id!] = getOptionValue(values[0])
        } else {
          options[item.id!] = getOptionValue(values[(currentIndex + 1) % values.length])
        }
      } else {
        options[item.id!] = !options[item.id!]
      }
    }}
    title={item.disabledReason ? `${item.disabledReason} | ${item.tooltip}` : item.tooltip}
    disabled={!!item.disabledReason || isDisabled(item)}
    style={{
      width: 150,
    }}
  />
}

export const OptionSlider = ({ item }: { item: Extract<OptionMeta, { type: 'slider' }> }) => {
  const optionValue = useSnapshot(options)[item.id!]

  const valueDisplay = useMemo(() => {
    if (item.valueText) return item.valueText(optionValue)
    return undefined // default display
  }, [optionValue])

  return <Slider disabledReason={isDisabled(item) ? 'qs' : undefined} label={item.text!} value={options[item.id!]} min={item.min} max={item.max} updateValue={(value) => {
    options[item.id!] = value
  }} unit={item.unit} valueDisplay={valueDisplay} updateOnDragEnd={item.delayApply} />
}

const OptionElement = ({ item }: { item: Extract<OptionMeta, { type: 'element' }> }) => {
  return item.render()
}

const RenderOption = ({ item }: { item: OptionMeta }) => {
  const { gameLoaded } = useSnapshot(miscUiState)
  if (item.id) {
    item.text ??= titleCase(noCase(item.id))
  }
  if (item.disabledDuringGame && gameLoaded) {
    item.disabledReason = 'Cannot be changed during game'
  }

  let baseElement = null as React.ReactNode | null
  if (item.type === 'toggle') baseElement = <OptionButton item={item} />
  if (item.type === 'slider') baseElement = <OptionSlider item={item} />
  if (item.type === 'element') baseElement = <OptionElement item={item} />
  return baseElement
  // if (!item.description && item.type === 'element') return baseElement

  // return <div>
  //   {baseElement}
  //   {item.description && <div style={{ fontSize: 9, color: 'gray' }}>{item.description}</div>}
  // </div>
}

interface Props {
  readonly items: OptionMeta[]
  title: string
  backButtonAction?: () => void
}

export default ({ items, title, backButtonAction }: Props) => {
  return <Screen
    title={title}
  >
    <div className='screen-items'>
      {items.map((element, i) => {
        // make sure its unique!
        return <RenderOption key={element.id ?? `${title}-${i}`} item={element} />
      })}
    </div>
    {backButtonAction && <Button onClick={() => backButtonAction()}>Back</Button>}
  </Screen>
}
