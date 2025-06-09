#pragma once

#include <memory>
#include <string>
#include <vector>
#include "HomeAssistantBaseMediaPlayer.h"

namespace esphome {
namespace homeassistant_media_player {

class HomeAssistantSpeakerMediaPlayer : public HomeAssistantBaseMediaPlayer {
 public:
  std::string mediaAlbum = "";
  int queueSize = 0;
  int queuePosition = 0;

  void setup() override;
  void ungroup();
  void joinGroup(std::string newSpeakerName);
  void updateVolumeLevel() override;
  void clearSource() override;
  media_player::MediaPlayerTraits get_traits();
  RemotePlayerType get_player_type() { return SpeakerRemotePlayerType; }
  void set_tv(HomeAssistantBaseMediaPlayer* new_tv) { tv = new_tv; }
  HomeAssistantBaseMediaPlayer* get_tv() { return tv; }
  virtual HomeAssistantBaseMediaPlayer* get_parent_media_player() {
    if (tv != NULL)
      return tv;
    return HomeAssistantBaseMediaPlayer::get_parent_media_player();
  }
  std::string mediaAlbumString();

 private:
  HomeAssistantBaseMediaPlayer* tv{nullptr};
  void subscribe_source() override;
  void media_album_changed(std::string state);
  void media_content_id_changed(std::string state);
  void queue_size_changed(std::string state);
  void queue_position_changed(std::string state);
};
}  // namespace homeassistant_media_player
}  // namespace esphome
