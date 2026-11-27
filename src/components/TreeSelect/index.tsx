'use client';

import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CaretRightFill, CheckLg, Search } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { matchesSearch } from '../../helpers/text.helper';
import { useUi } from '../../theme/context';
import Input from '../Input';

import styles from './index.module.scss';

export type TreeSelectNode = {
  value: string;
  label: string;
  children?: TreeSelectNode[];
  /** Shown and reachable by the keyboard, never selected. */
  isDisabled?: boolean;
};

export type TreeSelectLabels = {
  search: string;
  empty: string;
};

type BaseProps = {
  nodes: TreeSelectNode[];
  /** The tree's accessible name ("Kategoriler"). */
  label: string;
  /** Controlled expanded node values; uncontrolled when omitted. */
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** A search field above the tree: matches stay with their ancestors, which open. */
  hasSearch?: boolean;
  labels?: Partial<TreeSelectLabels>;
  className?: string;
  testId?: string;
};

type SingleProps = BaseProps & {
  isMultiple?: false;
  /** The selected value; activating it again clears it. */
  value: string | null;
  onChange: (value: string | null) => void;
};

type MultipleProps = BaseProps & {
  isMultiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export type TreeSelectProps = SingleProps | MultipleProps;

type VisibleNode = {
  node: TreeSelectNode;
  parent: string | null;
  hasChildren: boolean;
  isExpanded: boolean;
};

/** The nodes that match, with their ancestors; a matching node keeps its whole subtree. */
const filterTree = (
  nodes: TreeSelectNode[],
  query: string,
  opened: Set<string>,
): TreeSelectNode[] =>
  nodes.flatMap(node => {
    if (matchesSearch(node.label, query)) return [node];
    const children = filterTree(node.children ?? [], query, opened);
    if (children.length === 0) return [];
    opened.add(node.value);

    return [{ ...node, children }];
  });

/** The rows in view, in document order: what the arrow keys walk. */
const flatten = (
  nodes: TreeSelectNode[],
  expanded: Set<string>,
  parent: string | null = null,
  out: VisibleNode[] = [],
): VisibleNode[] => {
  for (const node of nodes) {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = hasChildren && expanded.has(node.value);
    out.push({ node, parent, hasChildren, isExpanded });
    if (isExpanded) flatten(node.children as TreeSelectNode[], expanded, node.value, out);
  }

  return out;
};

/** Category tree: expand and collapse, single or multiple choice, search (ARIA tree, 3.1). */
const TreeSelect = (props: TreeSelectProps) => {
  const {
    nodes,
    label,
    expanded: controlledExpanded,
    onExpandedChange,
    hasSearch,
    labels: labelProps,
    className,
    testId,
  } = props;
  const { labels: config } = useUi();
  const treeId = useId();
  const [innerExpanded, setInnerExpanded] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  /* Set by the keyboard: the newly focused item takes the focus after the render that shows it. */
  const pendingFocusRef = useRef<string | null>(null);

  const expandedList = controlledExpanded ?? innerExpanded;
  const selected = useMemo(
    () => new Set(props.isMultiple ? props.value : props.value === null ? [] : [props.value]),
    [props.isMultiple, props.value],
  );

  const { tree, expanded } = useMemo(() => {
    const open = new Set(expandedList);
    const term = query.trim();
    if (!term) return { tree: nodes, expanded: open };

    return { tree: filterTree(nodes, term, open), expanded: open };
  }, [nodes, expandedList, query]);

  const visible = useMemo(() => flatten(tree, expanded), [tree, expanded]);

  useEffect(() => {
    const value = pendingFocusRef.current;
    if (value === null) return;
    pendingFocusRef.current = null;
    itemRefs.current.get(value)?.focus();
  });

  const setExpanded = (value: string, isOpen: boolean) => {
    const next = isOpen
      ? [...expandedList.filter(item => item !== value), value]
      : expandedList.filter(item => item !== value);
    if (controlledExpanded === undefined) setInnerExpanded(next);
    onExpandedChange?.(next);
  };

  const choose = (node: TreeSelectNode) => {
    if (node.isDisabled) return;
    if (props.isMultiple) {
      props.onChange(
        selected.has(node.value)
          ? props.value.filter(item => item !== node.value)
          : [...props.value, node.value],
      );
    } else {
      props.onChange(selected.has(node.value) ? null : node.value);
    }
  };

  const focusValue = (value: string) => {
    pendingFocusRef.current = value;
    setFocused(value);
  };

  /* One Tab stop: the focused item if it is in view, else the first selected, else the first. */
  const tabStop =
    visible.find(item => item.node.value === focused)?.node.value ??
    visible.find(item => selected.has(item.node.value))?.node.value ??
    visible[0]?.node.value;

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const index = visible.findIndex(item => itemRefs.current.get(item.node.value) === event.target);
    if (index < 0) return;
    const item = visible[index];
    const { value } = item.node;

    const go = (target: VisibleNode | undefined) => target && focusValue(target.node.value);

    switch (event.key) {
      case 'ArrowDown':
        go(visible[index + 1]);
        break;
      case 'ArrowUp':
        go(visible[index - 1]);
        break;
      case 'Home':
        go(visible[0]);
        break;
      case 'End':
        go(visible.at(-1));
        break;
      case 'ArrowRight':
        if (item.hasChildren && !item.isExpanded) setExpanded(value, true);
        else if (item.isExpanded) go(visible[index + 1]);
        break;
      case 'ArrowLeft':
        if (item.isExpanded) setExpanded(value, false);
        else if (item.parent !== null) focusValue(item.parent);
        break;
      case 'Enter':
      case ' ':
        choose(item.node);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const renderNodes = (list: TreeSelectNode[], level: number): ReactNode =>
    list.map((node, position) => {
      const hasChildren = Boolean(node.children?.length);
      const isExpanded = hasChildren && expanded.has(node.value);
      const isSelected = selected.has(node.value);

      return (
        <li
          key={node.value}
          ref={element => {
            if (element) itemRefs.current.set(node.value, element);
            else itemRefs.current.delete(node.value);
          }}
          role="treeitem"
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={position + 1}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={isSelected}
          aria-disabled={node.isDisabled || undefined}
          tabIndex={node.value === tabStop ? 0 : -1}
          className={styles.item}
          onFocus={event => {
            if (event.target === event.currentTarget) setFocused(node.value);
          }}
        >
          <div
            className={cx(
              styles.row,
              isSelected && styles['row--selected'],
              node.isDisabled && styles['row--disabled'],
            )}
            onClick={() => {
              focusValue(node.value);
              choose(node);
            }}
          >
            <span
              aria-hidden
              className={cx(styles.toggle, isExpanded && styles['toggle--open'])}
              onClick={event => {
                if (!hasChildren) return;
                event.stopPropagation();
                focusValue(node.value);
                setExpanded(node.value, !isExpanded);
              }}
            >
              {hasChildren && <CaretRightFill />}
            </span>
            {props.isMultiple && (
              <span aria-hidden className={styles.check}>
                {isSelected && <CheckLg />}
              </span>
            )}
            <span className={styles.label}>{node.label}</span>
          </div>
          {isExpanded && (
            <ul role="group" className={styles.group}>
              {renderNodes(node.children as TreeSelectNode[], level + 1)}
            </ul>
          )}
        </li>
      );
    });

  const searchLabel = hasSearch
    ? resolveLabel('TreeSelect.labels.search', labelProps?.search, config?.treeSelect?.search)
    : '';

  return (
    <div className={cx(styles.treeSelect, className)} data-testid={testId}>
      {hasSearch && (
        <Input
          type="search"
          size="sm"
          value={query}
          onChange={event => setQuery(event.target.value)}
          aria-label={searchLabel}
          placeholder={searchLabel}
          aria-controls={visible.length > 0 ? treeId : undefined}
          prefix={<Search aria-hidden />}
        />
      )}

      {visible.length === 0 ? (
        <p role="status" className={styles.empty}>
          {resolveLabel('TreeSelect.labels.empty', labelProps?.empty, config?.treeSelect?.empty)}
        </p>
      ) : (
        <ul
          id={treeId}
          role="tree"
          aria-label={label}
          aria-multiselectable={props.isMultiple || undefined}
          className={styles.tree}
          onKeyDown={handleKeyDown}
        >
          {renderNodes(tree, 1)}
        </ul>
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(TreeSelect, 'TreeSelect'),
) as typeof TreeSelect;
