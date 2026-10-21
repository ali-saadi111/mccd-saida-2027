'use client';
/**
 * Adapted from 21st.dev "Animated Tabs" (@educalvolpz), underline variant: a
 * spring-animated indicator slides to the selected tab. Built on React Aria
 * Tabs so tabs and panels keep their roles, links and arrow-key navigation.
 */
import { useId } from 'react';
import { TabList, Tab } from 'react-aria-components';
import { motion } from 'motion/react';

export type AnimatedTab = { id: string; label: string; count?: string };

export function AnimatedTabList({
  tabs,
  label,
  className = '',
}: {
  tabs: AnimatedTab[];
  label: string;
  className?: string;
}) {
  const layoutId = useId();
  return (
    <TabList aria-label={label} className={'underline-tabs ' + className}>
      {tabs.map((tab) => (
        <Tab key={tab.id} id={tab.id} className="underline-tab">
          {({ isSelected }) => (
            <>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="underline-tab-count">{tab.count}</span>
              )}
              {isSelected && (
                <motion.span
                  layoutId={layoutId}
                  className="underline-tab-indicator"
                  transition={{ type: 'spring', bounce: 0.05, duration: 0.3 }}
                />
              )}
            </>
          )}
        </Tab>
      ))}
    </TabList>
  );
}
