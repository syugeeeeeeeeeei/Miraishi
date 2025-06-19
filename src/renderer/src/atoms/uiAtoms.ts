import { atom } from 'jotai'

/**
 * コントロールパネル（左側のメニュー）が開いているかどうかを管理するatom。
 * デフォルトは閉じている状態(false)とします。
 */
export const isControlPanelOpenAtom = atom(false)

/**
 * コントロールパネル内の検索フォームが表示されているかどうかを管理するatom。
 * ハンバーガーメニュー内の検索ボタンがクリックされたときにtrueにします。
 */
export const isSearchFormVisibleAtom = atom(false)
