// Lucide-style SVG icons. Все stroke, currentColor, 24×24 viewBox.
const svgProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const S = (w) => ({ width: w, height: w });

const Icon = ({ path, size = 16, ...rest }) => (
  <svg {...S(size)} {...svgProps} {...rest} dangerouslySetInnerHTML={{ __html: path }} />
);

const IconGrid       = (p) => <Icon {...p} path='<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' />;
const IconLayers     = (p) => <Icon {...p} path='<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' />;
const IconLayout     = (p) => <Icon {...p} path='<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>' />;
const IconDatabase   = (p) => <Icon {...p} path='<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' />;
const IconCode       = (p) => <Icon {...p} path='<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' />;
const IconActivity   = (p) => <Icon {...p} path='<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' />;
const IconSearch     = (p) => <Icon {...p} path='<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' />;
const IconBell       = (p) => <Icon {...p} path='<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' />;
const IconSettings   = (p) => <Icon {...p} path='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' />;
const IconChevronLeft  = (p) => <Icon {...p} path='<polyline points="15 18 9 12 15 6"/>' />;
const IconChevronRight = (p) => <Icon {...p} path='<polyline points="9 18 15 12 9 6"/>' />;
const IconChevronDown  = (p) => <Icon {...p} path='<polyline points="6 9 12 15 18 9"/>' />;
const IconChevronUp    = (p) => <Icon {...p} path='<polyline points="18 15 12 9 6 15"/>' />;
const IconPlus       = (p) => <Icon {...p} path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' />;
const IconTrash      = (p) => <Icon {...p} path='<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' />;
const IconEdit       = (p) => <Icon {...p} path='<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' />;
const IconClose      = (p) => <Icon {...p} path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' />;
const IconCheck      = (p) => <Icon {...p} path='<polyline points="20 6 9 17 4 12"/>' />;
const IconAlert      = (p) => <Icon {...p} path='<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' />;
const IconWarning    = (p) => <Icon {...p} path='<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' />;
const IconInfo       = (p) => <Icon {...p} path='<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' />;
const IconCalendar   = (p) => <Icon {...p} path='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' />;
const IconPlay       = (p) => <Icon {...p} path='<polygon points="5 3 19 12 5 21 5 3"/>' />;
const IconMore       = (p) => <Icon {...p} path='<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>' />;
const IconMoreV      = (p) => <Icon {...p} path='<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>' />;
const IconDrag       = (p) => <Icon {...p} path='<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>' />;
const IconHome       = (p) => <Icon {...p} path='<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' />;
const IconDownload   = (p) => <Icon {...p} path='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' />;
const IconFilter     = (p) => <Icon {...p} path='<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>' />;
const IconRefresh    = (p) => <Icon {...p} path='<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>' />;
const IconEye        = (p) => <Icon {...p} path='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' />;
const IconTerminal   = (p) => <Icon {...p} path='<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>' />;
const IconMap        = (p) => <Icon {...p} path='<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>' />;
const IconFileText   = (p) => <Icon {...p} path='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' />;
const IconZap        = (p) => <Icon {...p} path='<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' />;
const IconRadio      = (p) => <Icon {...p} path='<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>' />;

Object.assign(window, {
  IconGrid, IconLayers, IconLayout, IconDatabase, IconCode, IconActivity,
  IconSearch, IconBell, IconSettings,
  IconChevronLeft, IconChevronRight, IconChevronDown, IconChevronUp,
  IconPlus, IconTrash, IconEdit, IconClose, IconCheck, IconAlert, IconWarning, IconInfo,
  IconCalendar, IconPlay, IconMore, IconMoreV, IconDrag, IconHome, IconDownload,
  IconFilter, IconRefresh, IconEye, IconTerminal, IconMap, IconFileText, IconZap, IconRadio
});
