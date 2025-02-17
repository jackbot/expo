/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ABI44_0_0PickerEventEmitter.h"

namespace ABI44_0_0facebook {
namespace ABI44_0_0React {

void PickerEventEmitter::onChange(PickerIOSChangeEvent event) const {
  dispatchEvent("change", [event = std::move(event)](jsi::Runtime &runtime) {
    auto payload = jsi::Object(runtime);
    payload.setProperty(runtime, "newValue", event.newValue);
    payload.setProperty(runtime, "newIndex", event.newIndex);
    return payload;
  });
}

} // namespace ABI44_0_0React
} // namespace ABI44_0_0facebook
