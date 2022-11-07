# Zustand Tools

Tools for simpler [zustand](https://github.com/pmndrs/zustand) usage.

![Test](https://github.com/wuifdesign/zustand-tools/workflows/Test/badge.svg)
[![NPM](https://img.shields.io/npm/v/zustand-tools.svg)](https://www.npmjs.com/package/zustand-tools)

## Installation 

```bash
npm i zustand-tools
```

## Documentation

### createSimple(initStore, middlewares)

### Adding Middlewares

Middlewares can be added by passing an array as a second parameter.

```typescript
import { createSimple } from 'zustand-tools'
import { devtools } from 'zustand/middleware'

const dempStore = createSimple({ foo: 'bar' }, [(initializer) => devtools(initializer, { enabled: true })])
```
