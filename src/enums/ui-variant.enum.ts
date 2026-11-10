/** Button variants. */
enum UIVariant {
  /** The one expected action of the screen: cobalt fill. One per screen. */
  PRIMARY = 'PRIMARY',
  /** The conversion action (download, try, subscribe): coral fill — and only that. */
  ACCENT = 'ACCENT',
  /** Neutral secondary action: grey border, body text ("Cancel"). */
  SECONDARY = 'SECONDARY',
  /** Cobalt frame — an encouraged navigation that is not the primary action ("See all"). */
  OUTLINE = 'OUTLINE',
  /** Neutral fill; a secondary action inside a card. */
  SOFT = 'SOFT',
  /** No surface: toolbar and inline secondary actions, in the link colour. */
  GHOST = 'GHOST',
  /** Destructive action: a delete confirmation. */
  DANGER = 'DANGER',
  /** An action on the brand band (deep cobalt in both themes). */
  ON_BAND = 'ON_BAND',
}

export default UIVariant;
