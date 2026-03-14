import React, { useState } from 'react'
import styles from './StarRating.module.css'

export default function StarRating({ value = 0, onChange }) {
  const [hover, setHover] = useState(0)

  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={`${styles.star} ${n <= (hover || value) ? styles.filled : ''}`}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(n)}
        >★</span>
      ))}
    </div>
  )
}
