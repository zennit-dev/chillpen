import * as motion from "motion/react-client";
import type { ReactNode } from "react";

/**
 * Server-safe scroll-reveal animations (AGENTS-nextjs §23f). These render inside
 * server components — `motion/react-client` marks each as a client island. Use
 * `motion` from "motion/react-client" directly only inside client components.
 */

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const Up = ({ children, className, delay = 0 }: RevealProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.55, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

const Fade = ({ children, className, delay = 0 }: RevealProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

const Scale = ({ children, className, delay = 0 }: RevealProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0.96 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

const Stagger = ({ children, className, delay = 0 }: RevealProps) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-80px" }}
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.07, delayChildren: delay } },
    }}
  >
    {children}
  </motion.div>
);

const Item = ({ children, className }: Omit<RevealProps, "delay">) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    }}
  >
    {children}
  </motion.div>
);

export const Motion = { Up, Fade, Scale, Stagger, Item };
